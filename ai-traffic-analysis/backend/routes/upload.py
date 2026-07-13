"""
Upload & Analysis API Routes
POST /api/upload          - upload image or video and run detection
POST /api/analyze-traffic - dedicated traffic analysis endpoint
GET  /api/results         - list all past detection results
GET  /api/results/{id}    - get single result
GET  /api/stats           - aggregate statistics
GET  /api/media/{file}    - serve processed media
"""

import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from database.db import get_db, DetectionResult, ViolationLog
from ml.detector import TrafficDetector, process_image, process_video

router = APIRouter(prefix="/api", tags=["analysis"])

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
PROCESSED_DIR = UPLOAD_DIR / "processed"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".mp4"}
MAX_SIZE = int(os.getenv("MAX_FILE_SIZE", 104857600))  # 100MB

_detector: TrafficDetector | None = None


def get_detector() -> TrafficDetector:
    global _detector
    if _detector is None:
        model_path = os.getenv("MODEL_PATH", "yolov8n.pt")
        _detector = TrafficDetector(model_path)
    return _detector


async def _save_upload(file: UploadFile):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {ext}. Allowed: {ALLOWED_EXTENSIONS}")
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / unique_name
    async with aiofiles.open(save_path, "wb") as f:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(413, "File too large")
        await f.write(content)
    media_type = "video" if ext == ".mp4" else "image"
    return save_path, unique_name, media_type


def _run_detection(save_path: Path, unique_name: str, media_type: str):
    output_name = f"processed_{unique_name}"
    output_path = str(PROCESSED_DIR / output_name)
    detector = get_detector()
    try:
        if media_type == "image":
            result = process_image(str(save_path), output_path, detector)
        else:
            result = process_video(str(save_path), output_path, detector)
    except Exception as e:
        raise HTTPException(500, f"Detection failed: {str(e)}")
    return result, output_name


def _persist_result(db: Session, filename: str, media_type: str, result: dict, output_name: str):
    db_record = DetectionResult(
        filename=filename,
        media_type=media_type,
        total_vehicles=result["total_vehicles"],
        vehicle_counts=result["vehicle_counts"],
        violations=result["violations"],
        density_level=result["density_level"],
        processed_path=output_name,
        lane_counts=result.get("lane_counts"),
        signal_timing=result.get("signal_timing"),
        emergency_status=result.get("emergency_status"),
        traffic_alert=result.get("traffic_alert"),
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    for v in result["violations"]:
        db.add(ViolationLog(
            detection_id=db_record.id,
            violation_type=v["type"],
            confidence=v.get("confidence", 0),
            frame_number=v.get("frame", 0),
            description=v.get("description", ""),
        ))
    db.commit()
    return db_record


def _build_response(filename: str, media_type: str, result: dict, output_name: str, record_id: int):
    return {
        "id": record_id,
        "filename": filename,
        "media_type": media_type,
        "total_vehicles": result["total_vehicles"],
        "vehicle_counts": result["vehicle_counts"],
        "violations": result["violations"],
        "density_level": result["density_level"],
        "processed_url": f"/api/media/{output_name}",
        "lane_counts": result.get("lane_counts"),
        "signal_timing": result.get("signal_timing"),
        "emergency_status": result.get("emergency_status"),
        "traffic_alert": result.get("traffic_alert"),
    }


@router.post("/upload")
async def upload_and_analyze(file: UploadFile = File(...), db: Session = Depends(get_db)):
    save_path, unique_name, media_type = await _save_upload(file)
    result, output_name = _run_detection(save_path, unique_name, media_type)
    record = _persist_result(db, file.filename, media_type, result, output_name)
    return _build_response(file.filename, media_type, result, output_name, record.id)


@router.post("/analyze-traffic")
async def analyze_traffic(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Dedicated adaptive traffic analysis endpoint.
    Returns lane_counts, signal_timing, emergency_status, traffic_alert, total_vehicles.
    """
    save_path, unique_name, media_type = await _save_upload(file)
    result, output_name = _run_detection(save_path, unique_name, media_type)
    record = _persist_result(db, file.filename, media_type, result, output_name)
    return _build_response(file.filename, media_type, result, output_name, record.id)


@router.get("/results")
def list_results(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    import json

    def _parse(field):
        if field is None:
            return None
        if isinstance(field, (dict, list)):
            return field
        try:
            return json.loads(field)
        except Exception:
            return None

    records = db.query(DetectionResult).order_by(
        DetectionResult.created_at.desc()
    ).offset(skip).limit(limit).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "media_type": r.media_type,
            "total_vehicles": r.total_vehicles,
            "vehicle_counts": _parse(r.vehicle_counts),
            "density_level": r.density_level,
            "violation_count": len(_parse(r.violations) or []),
            "created_at": r.created_at.isoformat(),
            "processed_url": f"/api/media/{r.processed_path}",
            "lane_counts": _parse(r.lane_counts),
            "traffic_alert": _parse(r.traffic_alert),
            "emergency_status": _parse(r.emergency_status),
        }
        for r in records
    ]


@router.get("/results/{result_id}")
def get_result(result_id: int, db: Session = Depends(get_db)):
    import json

    def _parse(field):
        if field is None:
            return None
        if isinstance(field, (dict, list)):
            return field
        try:
            return json.loads(field)
        except Exception:
            return None

    record = db.query(DetectionResult).filter(DetectionResult.id == result_id).first()
    if not record:
        raise HTTPException(404, "Result not found")
    violations = db.query(ViolationLog).filter(ViolationLog.detection_id == result_id).all()
    return {
        "id": record.id,
        "filename": record.filename,
        "media_type": record.media_type,
        "total_vehicles": record.total_vehicles,
        "vehicle_counts": _parse(record.vehicle_counts),
        "violations": [
            {
                "id": v.id,
                "type": v.violation_type,
                "confidence": v.confidence,
                "frame": v.frame_number,
                "description": v.description,
                "created_at": v.created_at.isoformat(),
            }
            for v in violations
        ],
        "density_level": record.density_level,
        "created_at": record.created_at.isoformat(),
        "processed_url": f"/api/media/{record.processed_path}",
        "lane_counts": _parse(record.lane_counts),
        "signal_timing": _parse(record.signal_timing),
        "emergency_status": _parse(record.emergency_status),
        "traffic_alert": _parse(record.traffic_alert),
    }


@router.get("/media/{filename}")
def serve_media(filename: str):
    file_path = PROCESSED_DIR / filename
    if not file_path.exists():
        raise HTTPException(404, "File not found")
    return FileResponse(str(file_path))


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Aggregate stats for dashboard overview."""
    import json

    def _parse(field):
        """Safely parse a field that may be a dict already or a JSON string (SQLite stores as text)."""
        if field is None:
            return None
        if isinstance(field, dict):
            return field
        try:
            return json.loads(field)
        except Exception:
            return None

    total_analyses = db.query(DetectionResult).count()
    all_records = db.query(DetectionResult).all()

    total_vehicles = sum(r.total_vehicles for r in all_records)
    total_violations = sum(len(r.violations) if r.violations else 0 for r in all_records)

    type_totals: dict = {}
    for r in all_records:
        vc = _parse(r.vehicle_counts)
        if vc:
            for k, v in vc.items():
                type_totals[k] = type_totals.get(k, 0) + v

    density_dist = {"Low": 0, "Medium": 0, "High": 0}
    for r in all_records:
        if r.density_level in density_dist:
            density_dist[r.density_level] += 1

    emergency_count = sum(
        1 for r in all_records
        if (_parse(r.emergency_status) or {}).get("emergency") is True
    )
    high_traffic_count = sum(
        1 for r in all_records
        if (_parse(r.traffic_alert) or {}).get("level") in ("CRITICAL", "EMERGENCY")
    )

    return {
        "total_analyses": total_analyses,
        "total_vehicles_detected": total_vehicles,
        "total_violations": total_violations,
        "vehicle_type_totals": type_totals,
        "density_distribution": density_dist,
        "emergency_events": emergency_count,
        "high_traffic_events": high_traffic_count,
    }
