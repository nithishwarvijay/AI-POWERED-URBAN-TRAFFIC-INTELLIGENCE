"""
Lane Detection & Smart Signal Control Module

Key Feature: Emergency Vehicle Priority Signal System
- Detects ambulance / fire truck / police in a specific lane
- Turns GREEN only the lane containing the emergency vehicle
- All other lanes stay RED until emergency vehicle clears
- Normal adaptive timing resumes after emergency is resolved
"""

import cv2
import numpy as np
from typing import Optional

# ─────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────

# Keywords used to identify emergency vehicles from YOLO raw labels
EMERGENCY_KEYWORDS = ["ambulance", "fire truck", "fire_truck", "police", "emergency"]

# Lane boundaries as fractions of frame width  (4 lanes)
LANE_BOUNDARIES = [0.0, 0.25, 0.50, 0.75, 1.0]
LANE_NAMES = ["lane1", "lane2", "lane3", "lane4"]

# Normal signal timing based on vehicle count in lane
TIMING_RULES = [
    (0,  3,  "RED",    0),   # empty lane → stay red
    (4,  8,  "GREEN", 20),   # low traffic → 20s green
    (9, 15,  "GREEN", 35),   # medium      → 35s green
    (16, 999,"GREEN", 50),   # heavy       → 50s green
]

# Emergency override values
EMERGENCY_SIGNAL  = "GREEN"
EMERGENCY_TIME    = 60      # seconds green for emergency lane
BLOCKED_SIGNAL    = "RED"
BLOCKED_TIME      = 0       # all other lanes blocked

# Annotation colors (BGR)
COLOR_GREEN   = (0, 220, 0)
COLOR_RED     = (0, 0, 220)
COLOR_YELLOW  = (0, 200, 255)
COLOR_WHITE   = (255, 255, 255)
COLOR_BLACK   = (0, 0, 0)
COLOR_EMERGENCY = (0, 100, 255)   # orange-red for emergency banner


# ─────────────────────────────────────────────
# LANE UTILITIES
# ─────────────────────────────────────────────

def get_lane_for_bbox(bbox: list, frame_width: int) -> str:
    """
    Determine which lane a detection belongs to based on
    the horizontal center of its bounding box.
    """
    x1, _, x2, _ = bbox
    cx = (x1 + x2) / 2.0
    ratio = cx / frame_width

    for i in range(len(LANE_BOUNDARIES) - 1):
        if LANE_BOUNDARIES[i] <= ratio < LANE_BOUNDARIES[i + 1]:
            return LANE_NAMES[i]

    return LANE_NAMES[-1]  # fallback to last lane


def count_vehicles_per_lane(detections: list, frame_width: int) -> dict:
    """Count how many vehicles are in each lane."""
    counts = {lane: 0 for lane in LANE_NAMES}
    for det in detections:
        lane = get_lane_for_bbox(det["bbox"], frame_width)
        counts[lane] += 1
    return counts


# ─────────────────────────────────────────────
# EMERGENCY VEHICLE DETECTION
# ─────────────────────────────────────────────

def detect_emergency_vehicles(detections: list, frame_width: int = None) -> dict:
    """
    Scan detections for emergency vehicles (ambulance, fire truck, police).

    Returns:
        {
            "emergency": bool,
            "vehicle_type": str or None,
            "lane": str or None,          ← which lane the emergency vehicle is in
            "bbox": list or None,
            "confidence": float,
            "message": str,
            "action": str                 ← human-readable action taken
        }
    """
    for det in detections:
        raw = det.get("raw_label", det.get("label", "")).lower()
        label = det.get("label", "").lower()

        is_emergency = any(kw in raw for kw in EMERGENCY_KEYWORDS) or \
                       any(kw in label for kw in EMERGENCY_KEYWORDS)

        if is_emergency:
            lane = None
            if frame_width:
                lane = get_lane_for_bbox(det["bbox"], frame_width)

            vehicle_type = next(
                (kw for kw in EMERGENCY_KEYWORDS if kw in raw or kw in label),
                "emergency vehicle"
            )

            return {
                "emergency": True,
                "vehicle_type": vehicle_type,
                "lane": lane,
                "bbox": det["bbox"],
                "confidence": det.get("confidence", 0.9),
                "message": f"🚨 EMERGENCY: {vehicle_type.upper()} detected in {lane or 'unknown lane'}",
                "action": f"Signal GREEN only for {lane or 'emergency lane'} — all others RED",
            }

    return {
        "emergency": False,
        "vehicle_type": None,
        "lane": None,
        "bbox": None,
        "confidence": 0.0,
        "message": "No emergency vehicle detected",
        "action": "Normal adaptive signal control active",
    }


# ─────────────────────────────────────────────
# SIGNAL TIMING
# ─────────────────────────────────────────────

def _normal_signal(vehicle_count: int) -> dict:
    """Return normal signal state based on vehicle count."""
    for low, high, signal, time in TIMING_RULES:
        if low <= vehicle_count <= high:
            return {"signal": signal, "time": time}
    return {"signal": "RED", "time": 0}


def compute_signal_timing(lane_counts: dict, emergency_status: dict = None) -> dict:
    """
    Compute signal timing for all lanes.

    EMERGENCY LOGIC:
    - If emergency vehicle is detected in a specific lane:
        → That lane gets GREEN for 60 seconds
        → ALL other lanes get RED (blocked)
    - If no emergency:
        → Normal adaptive timing based on vehicle count per lane
    """
    timing = {}

    # ── Emergency override: only the emergency lane gets GREEN ──
    if emergency_status and emergency_status.get("emergency"):
        emergency_lane = emergency_status.get("lane")

        for lane in LANE_NAMES:
            if lane == emergency_lane:
                timing[lane] = {
                    "signal": EMERGENCY_SIGNAL,
                    "time": EMERGENCY_TIME,
                    "reason": f"EMERGENCY — {emergency_status.get('vehicle_type', 'emergency vehicle')} detected",
                    "priority": "EMERGENCY",
                }
            else:
                timing[lane] = {
                    "signal": BLOCKED_SIGNAL,
                    "time": BLOCKED_TIME,
                    "reason": "Blocked — emergency vehicle in adjacent lane",
                    "priority": "BLOCKED",
                }
        return timing

    # ── Normal adaptive timing ──
    for lane in LANE_NAMES:
        count = lane_counts.get(lane, 0)
        state = _normal_signal(count)
        timing[lane] = {
            "signal": state["signal"],
            "time": state["time"],
            "reason": f"{count} vehicles detected",
            "priority": "NORMAL",
        }

    return timing


# ─────────────────────────────────────────────
# TRAFFIC ALERT
# ─────────────────────────────────────────────

def compute_traffic_alert(total_vehicles: int, emergency_status: dict = None) -> dict:
    """Generate a traffic alert based on vehicle count and emergency status."""

    if emergency_status and emergency_status.get("emergency"):
        return {
            "alert": emergency_status["message"],
            "level": "EMERGENCY",
            "action": emergency_status["action"],
            "color": "red",
        }

    if total_vehicles >= 20:
        return {
            "alert": f"CRITICAL congestion — {total_vehicles} vehicles detected",
            "level": "CRITICAL",
            "action": "Extend green signals, notify traffic control",
            "color": "red",
        }
    elif total_vehicles >= 10:
        return {
            "alert": f"Moderate traffic — {total_vehicles} vehicles",
            "level": "WARNING",
            "action": "Monitor and adjust signal timing",
            "color": "yellow",
        }
    else:
        return {
            "alert": f"Normal traffic flow — {total_vehicles} vehicles",
            "level": "NORMAL",
            "action": "Standard signal timing active",
            "color": "green",
        }


# ─────────────────────────────────────────────
# FRAME ANNOTATION
# ─────────────────────────────────────────────

def annotate_lanes(
    frame: np.ndarray,
    lane_counts: dict,
    signal_timing: dict,
    emergency_status: dict,
) -> np.ndarray:
    """
    Draw lane dividers, signal states, and emergency alert banner on frame.
    Emergency lane gets a highlighted GREEN box; all others show RED.
    """
    h, w = frame.shape[:2]
    annotated = frame.copy()

    # ── Draw lane dividers ──
    for i in range(1, len(LANE_BOUNDARIES) - 1):
        x = int(LANE_BOUNDARIES[i] * w)
        cv2.line(annotated, (x, 0), (x, h), (200, 200, 200), 1, cv2.LINE_AA)

    # ── Draw signal box per lane ──
    box_h = 60
    box_y = h - box_h - 10

    for i, lane in enumerate(LANE_NAMES):
        x1 = int(LANE_BOUNDARIES[i] * w) + 4
        x2 = int(LANE_BOUNDARIES[i + 1] * w) - 4

        timing = signal_timing.get(lane, {"signal": "RED", "time": 0})
        signal = timing["signal"]
        time_s = timing["time"]
        priority = timing.get("priority", "NORMAL")

        # Box color based on signal
        if signal == "GREEN":
            box_color = COLOR_GREEN
            text_color = COLOR_BLACK
        else:
            box_color = COLOR_RED
            text_color = COLOR_WHITE

        # Thicker border for emergency lane
        thickness = -1  # filled
        cv2.rectangle(annotated, (x1, box_y), (x2, box_y + box_h), box_color, thickness)
        cv2.rectangle(annotated, (x1, box_y), (x2, box_y + box_h), COLOR_WHITE, 1)

        count = lane_counts.get(lane, 0)
        lane_label = f"L{i+1}: {count}v"
        signal_label = f"{signal}" + (f" {time_s}s" if time_s > 0 else "")

        cv2.putText(annotated, lane_label,
                    (x1 + 4, box_y + 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, text_color, 1, cv2.LINE_AA)
        cv2.putText(annotated, signal_label,
                    (x1 + 4, box_y + 42),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, text_color, 1, cv2.LINE_AA)

        # Mark emergency lane with ambulance icon text
        if priority == "EMERGENCY":
            cv2.putText(annotated, "EMRG",
                        (x1 + 4, box_y - 6),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, COLOR_EMERGENCY, 1, cv2.LINE_AA)

    # ── Emergency banner at top ──
    if emergency_status and emergency_status.get("emergency"):
        banner_h = 44
        overlay = annotated.copy()
        cv2.rectangle(overlay, (0, 0), (w, banner_h), (0, 0, 180), -1)
        cv2.addWeighted(overlay, 0.85, annotated, 0.15, 0, annotated)

        msg = emergency_status.get("message", "EMERGENCY VEHICLE DETECTED")
        action = emergency_status.get("action", "")

        cv2.putText(annotated, msg,
                    (10, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLOR_WHITE, 2, cv2.LINE_AA)
        cv2.putText(annotated, action,
                    (10, 38), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 220, 255), 1, cv2.LINE_AA)

    return annotated
