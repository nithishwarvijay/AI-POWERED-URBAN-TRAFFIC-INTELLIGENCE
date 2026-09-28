"""
Algorithm 1 — Vehicle Detection (YOLO11)
=========================================
Paper mapping:
  Step 1: Capture traffic input from camera / dataset
  Step 2: Process input using OpenCV (resize, normalize, define ROI)
  Step 3: Apply YOLOv11 detection model
  Step 4: Detect vehicles and emergency vehicles as distinct classes
  Step 5: Generate vehicle count and structured traffic data
           (per class, per frame) with schema:
           {class, confidence, bbox, approach, is_emergency}

Upgrade notes:
  - Detector upgraded from YOLOv8 (yolov8n.pt) to YOLOv11 (yolo11n.pt).
    The old yolov8n.pt file is kept in place for A/B comparison but is no
    longer loaded by default.  Set MODEL_PATH=yolov8n.pt in .env to revert.
  - Emergency vehicle class: COCO classes (car/bus/truck/motorcycle) do not
    include a dedicated "ambulance/fire/police" class.  is_emergency is a
    heuristic stub (label keyword matching) so the output schema already
    matches Algorithm 4's expected {class, confidence, bbox, approach,
    is_emergency} shape for later plug-in.  Do NOT treat is_emergency=True
    as a trained classifier result — it is a best-effort heuristic only.
"""

# pyrefly: ignore [missing-import]
import cv2
import numpy as np
# pyrefly: ignore [missing-import]
from ultralytics import YOLO
from typing import Optional

from ml.lane_detector import (
    count_vehicles_per_lane,
    compute_signal_timing,
    detect_emergency_vehicles,
    compute_traffic_alert,
    annotate_lanes,
)

# ---------------------------------------------------------------------------
# COCO class IDs → traffic-relevant vehicle types (unchanged from YOLOv8 era)
# ---------------------------------------------------------------------------
VEHICLE_CLASS_MAP = {
    2: "car",
    3: "bike",       # motorcycle in COCO
    5: "bus",
    7: "truck",
    1: "bike",       # bicycle
}

# Keywords that trigger the is_emergency heuristic stub.
# NOTE: Standard COCO-trained YOLO11 does NOT have a trained emergency class.
# This is purely keyword-based on the raw YOLO label string.
EMERGENCY_KEYWORDS = ["ambulance", "fire truck", "fire_truck", "police", "emergency"]

# Colors per vehicle type (BGR)
CLASS_COLORS = {
    "car":     (0, 255, 0),
    "bike":    (255, 165, 0),
    "bus":     (0, 0, 255),
    "truck":   (128, 0, 128),
    "auto":    (0, 255, 255),
    "unknown": (200, 200, 200),
}

VIOLATION_COLOR = (0, 0, 255)   # Red for violations


# ---------------------------------------------------------------------------
# Approach / ROI helpers
# ---------------------------------------------------------------------------

# Four approaches (N/S/E/W) are mapped to the existing 4-lane split.
# lane1 → North, lane2 → East, lane3 → South, lane4 → West
LANE_TO_APPROACH = {
    "lane1": "N",
    "lane2": "E",
    "lane3": "S",
    "lane4": "W",
}


def _get_approach(bbox: list, frame_width: int) -> str:
    """Map a bounding-box to an N/E/S/W approach label."""
    x1, _, x2, _ = bbox
    cx = (x1 + x2) / 2.0
    ratio = cx / frame_width
    if ratio < 0.25:
        return "N"
    elif ratio < 0.50:
        return "E"
    elif ratio < 0.75:
        return "S"
    return "W"


# ---------------------------------------------------------------------------
# TrafficDetector  (Algorithm 1 core)
# ---------------------------------------------------------------------------

class TrafficDetector:
    """
    Algorithm 1 — Vehicle Detection using YOLOv11.

    Model upgrade:
      Default model is yolo11n.pt (Ultralytics YOLO11 nano).
      Falls back gracefully if the weights file is not cached yet —
      Ultralytics will download it automatically on the first run.
    """

    def __init__(self, model_path: str = "yolo11n.pt"):
        """
        Load YOLO11 model.  Downloads automatically on first run.
        yolov8n.pt is preserved on disk for A/B comparison — not loaded here.
        """
        self.model = YOLO(model_path)
        self.conf_threshold = 0.4
        self.iou_threshold = 0.45
        self.model_path = model_path

    # ------------------------------------------------------------------
    # Step 2 + 3: OpenCV pre-processing + YOLO11 inference
    # ------------------------------------------------------------------

    def _preprocess(self, frame: np.ndarray) -> np.ndarray:
        """
        Algorithm 1 Step 2 — OpenCV pre-processing.
        Resize to 640px inference width to maximize execution speed while preserving accuracy.
        """
        max_side = 640
        h, w = frame.shape[:2]
        if max(h, w) > max_side:
            scale = max_side / max(h, w)
            frame = cv2.resize(frame, (int(w * scale), int(h * scale)),
                               interpolation=cv2.INTER_LINEAR)
        return frame

    def detect_vehicles(self, frame: np.ndarray) -> list:
        """
        Algorithm 1 Steps 3–5 — YOLO11 inference + structured output.
        """
        # Step 2 — pre-process
        proc = self._preprocess(frame)
        h_orig, w_orig = frame.shape[:2]
        h_proc, w_proc = proc.shape[:2]
        scale_x = w_orig / w_proc
        scale_y = h_orig / h_proc

        # Step 3 — YOLO11 inference (imgsz=640 for fast throughput)
        results = self.model(
            proc,
            conf=self.conf_threshold,
            iou=self.iou_threshold,
            imgsz=640,
            verbose=False,
        )[0]


        detections = []
        names = results.names  # {id: class_name}

        for box in results.boxes:
            cls_id   = int(box.cls[0])
            raw_label = names.get(cls_id, "").lower()
            conf      = float(box.conf[0])
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # Scale back to original frame coordinates
            x1 = int(x1 * scale_x); x2 = int(x2 * scale_x)
            y1 = int(y1 * scale_y); y2 = int(y2 * scale_y)

            # Step 4 — classify vehicle / emergency heuristic
            is_emergency = any(kw in raw_label for kw in EMERGENCY_KEYWORDS)

            if cls_id in VEHICLE_CLASS_MAP:
                label = VEHICLE_CLASS_MAP[cls_id]
            elif is_emergency:
                label = raw_label
            else:
                continue   # non-vehicle COCO class; skip

            approach = _get_approach([x1, y1, x2, y2], w_orig)

            # Step 5 — structured output (paper schema)
            detections.append({
                "label":        label,
                "raw_label":    raw_label,
                "confidence":   round(conf, 3),
                "bbox":         [x1, y1, x2, y2],
                "approach":     approach,
                "is_emergency": is_emergency,   # stub — see docstring
            })

        return detections

    # ------------------------------------------------------------------
    # Violation checking (unchanged logic, unchanged dashboard API shape)
    # ------------------------------------------------------------------

    def check_violations(self, detections: list, frame: np.ndarray, frame_idx: int = 0) -> list:
        """
        Rule-based violation detection on top of YOLO11 detections.
        Checks: overcrowding on bikes, density-based congestion.
        """
        violations = []
        h, w = frame.shape[:2]
        bikes = [d for d in detections if d["label"] == "bike"]

        for bike in bikes:
            bx1, by1, bx2, by2 = bike["bbox"]
            if (by2 - by1) > (bx2 - bx1) * 1.8:
                violations.append({
                    "type": "overcrowding_two_wheeler",
                    "confidence": 0.72,
                    "frame": frame_idx,
                    "bbox": bike["bbox"],
                    "description": "Possible overcrowding detected on two-wheeler",
                })

        bottom_half = [d for d in detections if d["bbox"][3] > h * 0.5]
        if len(bottom_half) > 8:
            violations.append({
                "type": "high_congestion",
                "confidence": 0.85,
                "frame": frame_idx,
                "bbox": None,
                "description": f"High traffic congestion detected ({len(bottom_half)} vehicles in zone)",
            })

        return violations

    def annotate_frame(self, frame: np.ndarray, detections: list, violations: list) -> np.ndarray:
        """Draw bounding boxes, labels, and violation highlights on frame."""
        annotated = frame.copy()
        violation_bboxes = {tuple(v["bbox"]) for v in violations if v.get("bbox")}

        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            label = det["label"]
            conf  = det["confidence"]
            color = CLASS_COLORS.get(label, CLASS_COLORS["unknown"])

            if (x1, y1, x2, y2) in violation_bboxes:
                color = VIOLATION_COLOR

            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            # Annotate approach label alongside class
            approach = det.get("approach", "")
            text = f"{label}({approach}) {conf:.2f}"
            (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(annotated, (x1, y1 - th - 6), (x1 + tw + 4, y1), color, -1)
            cv2.putText(annotated, text, (x1 + 2, y1 - 4),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        if violations:
            cv2.rectangle(annotated, (0, 0), (frame.shape[1], 36), (0, 0, 180), -1)
            cv2.putText(annotated, f"VIOLATIONS DETECTED: {len(violations)}",
                        (10, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        return annotated

    def count_vehicles(self, detections: list) -> dict:
        counts = {}
        for d in detections:
            counts[d["label"]] = counts.get(d["label"], 0) + 1
        return counts

    def get_density_level(self, total: int) -> str:
        if total <= 5:
            return "Low"
        elif total <= 15:
            return "Medium"
        return "High"


# ---------------------------------------------------------------------------
# Orchestrated image / video pipeline (wires Alg 1 → Alg 2 → Alg 3)
# ---------------------------------------------------------------------------

def _run_full_pipeline(detections: list, frame_width: int,
                       total: int, detector: "TrafficDetector",
                       violations: list, output_path: str,
                       frame: Optional[np.ndarray] = None) -> dict:
    """
    Orchestration helper: runs Algorithm 2 (density) and Algorithm 3 (RL signal)
    after Algorithm 1 (detection) is complete for a frame/image.
    """
    from ml.density import compute_approach_densities
    from ml.signal_rl import get_signal_optimizer

    # ── Algorithm 2: density per approach ──
    approach_densities = compute_approach_densities(detections, frame_width)

    # ── Legacy lane_counts (dashboard backward compat) ──
    lane_counts = count_vehicles_per_lane(detections, frame_width)
    emergency_status = detect_emergency_vehicles(detections, frame_width=frame_width)

    # ── Algorithm 3: RL signal decision ──
    optimizer = get_signal_optimizer()
    rl_decision = optimizer.decide(approach_densities, emergency_status)

    # ── Legacy signal_timing (dashboard backward compat) ──
    signal_timing = compute_signal_timing(lane_counts, emergency_status)
    traffic_alert = compute_traffic_alert(total, emergency_status)

    return {
        "total_vehicles":    total,
        "vehicle_counts":    detector.count_vehicles(detections),
        "violations":        violations,
        "density_level":     detector.get_density_level(total),
        "processed_path":    output_path,
        "lane_counts":       lane_counts,
        "signal_timing":     signal_timing,
        "emergency_status":  emergency_status,
        "traffic_alert":     traffic_alert,
        # New Alg 2 + 3 fields (additive — dashboard ignores unknown keys)
        "approach_densities": approach_densities,
        "rl_signal_decision": rl_decision,
    }


def process_image(image_path: str, output_path: str, detector: "TrafficDetector") -> dict:
    """Process a single image file through Algorithms 1 → 2 → 3."""
    frame = cv2.imread(image_path)
    if frame is None:
        raise ValueError(f"Cannot read image: {image_path}")

    h, w = frame.shape[:2]
    detections = detector.detect_vehicles(frame)
    violations = detector.check_violations(detections, frame)
    total = len(detections)

    result = _run_full_pipeline(detections, w, total, detector, violations, output_path, frame)

    # Annotate & save
    annotated = detector.annotate_frame(frame, detections, violations)
    annotated = annotate_lanes(annotated, result["lane_counts"],
                               result["signal_timing"], result["emergency_status"])
    cv2.imwrite(output_path, annotated)

    return result


def process_video(video_path: str, output_path: str, detector: "TrafficDetector",
                  sample_every: int = 5) -> dict:
    """
    Process a video file frame by frame through Algorithms 1 → 2 → 3.
    sample_every: analyze every Nth frame only.
    """
    from ml.lane_detector import annotate_lanes, compute_signal_timing
    from ml.density import compute_approach_densities
    from ml.signal_rl import get_signal_optimizer

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")

    fps    = cap.get(cv2.CAP_PROP_FPS) or 25
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    all_violations: list = []
    cumulative_counts: dict = {}
    cumulative_lane_counts = {f"lane{i}": 0 for i in range(1, 5)}
    frame_idx = 0

    last_detections: list = []
    last_violations: list = []
    last_lane_counts  = {f"lane{i}": 0 for i in range(1, 5)}
    last_signal_timing = compute_signal_timing(last_lane_counts)
    last_emergency     = {"emergency": False}
    last_approach_densities: dict = {}
    last_rl_decision:   dict = {}

    optimizer = get_signal_optimizer()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % sample_every == 0:
            last_detections = detector.detect_vehicles(frame)
            last_violations = detector.check_violations(last_detections, frame, frame_idx)
            all_violations.extend(last_violations)

            for label, cnt in detector.count_vehicles(last_detections).items():
                cumulative_counts[label] = max(cumulative_counts.get(label, 0), cnt)

            last_lane_counts = count_vehicles_per_lane(last_detections, width)
            for lane, cnt in last_lane_counts.items():
                cumulative_lane_counts[lane] = max(cumulative_lane_counts[lane], cnt)

            last_emergency        = detect_emergency_vehicles(last_detections, frame_width=width)
            last_signal_timing    = compute_signal_timing(last_lane_counts, last_emergency)
            last_approach_densities = compute_approach_densities(last_detections, width)
            last_rl_decision      = optimizer.decide(last_approach_densities, last_emergency)

        annotated = detector.annotate_frame(frame, last_detections, last_violations)
        annotated = annotate_lanes(annotated, last_lane_counts, last_signal_timing, last_emergency)
        writer.write(annotated)
        frame_idx += 1

    cap.release()
    writer.release()

    total = sum(cumulative_counts.values())
    final_emergency       = last_emergency
    final_signal_timing   = compute_signal_timing(cumulative_lane_counts, final_emergency)
    final_approach_densities = compute_approach_densities(
        [], width,
        override_counts={k.replace("lane", ""): v for k, v in cumulative_lane_counts.items()}
    )
    final_rl_decision = optimizer.decide(final_approach_densities, final_emergency)

    return {
        "total_vehicles":    total,
        "vehicle_counts":    cumulative_counts,
        "violations":        all_violations[:50],
        "density_level":     detector.get_density_level(total),
        "processed_path":    output_path,
        "frames_processed":  frame_idx,
        "lane_counts":       cumulative_lane_counts,
        "signal_timing":     final_signal_timing,
        "emergency_status":  final_emergency,
        "traffic_alert":     compute_traffic_alert(total),
        "approach_densities": final_approach_densities,
        "rl_signal_decision": final_rl_decision,
    }
