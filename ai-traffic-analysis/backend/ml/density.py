"""
Algorithm 2 — Traffic Density Analysis
========================================
Paper mapping:
  Step 1: Receive detected vehicle count per approach (N/E/S/W) from Alg 1
  Step 2: Calculate vehicle density for each approach:
          density_score = clamp(0–100) using count, occupancy (bbox area / ROI
          area), and optionally queue length
  Step 3: Compare congestion levels across approaches
  Step 4: Identify high-traffic regions (flag approaches above threshold)

The result is a per-approach density dict consumed by Algorithm 3.

Configuration:
  HIGH_DENSITY_THRESHOLD  — approaches above this score are flagged (default 70)
  ROI_FRACTION            — fraction of frame area counted as ROI per approach
  MAX_EXPECTED_VEHICLES   — count at which density saturates to 100
  OCCUPANCY_WEIGHT        — weight of bbox-occupancy vs raw count in score
  COUNT_WEIGHT            — weight of raw count in score
"""

import numpy as np
from typing import Optional

# ---------------------------------------------------------------------------
# Configuration (tunable without code changes via subclass or env)
# ---------------------------------------------------------------------------
HIGH_DENSITY_THRESHOLD  = 70    # density score (0–100) above which approach is flagged
MAX_EXPECTED_VEHICLES   = 20    # vehicle count at which density saturates at 100
ROI_FRACTION            = 0.25  # each approach occupies ~25% of the frame width
OCCUPANCY_WEIGHT        = 0.4   # contribution of bbox-area occupancy to density score
COUNT_WEIGHT            = 0.6   # contribution of raw vehicle count to density score

APPROACH_LABELS = ("N", "E", "S", "W")


# ---------------------------------------------------------------------------
# Core density computation (Algorithm 2)
# ---------------------------------------------------------------------------

def _bbox_area(bbox: list) -> float:
    x1, y1, x2, y2 = bbox
    return max(0.0, float(x2 - x1)) * max(0.0, float(y2 - y1))


def compute_approach_densities(
    detections: list,
    frame_width: int,
    frame_height: int = 720,          # default; overridden by actual frame dims
    override_counts: Optional[dict] = None,
) -> dict:
    """
    Algorithm 2 — Traffic Density Analysis.

    Args:
        detections:     list of detection dicts from Algorithm 1
                        (must contain 'approach' and 'bbox' keys)
        frame_width:    width of the source frame in pixels
        frame_height:   height of the source frame in pixels
        override_counts: optional {approach_letter: count} to skip bbox math
                         (used in video cumulative pass where we have counts
                         but not individual bboxes any more)

    Returns:
        {
          "N": {
            "count":           int,
            "occupancy_ratio": float (0–1),
            "queue_length":    int   (heuristic: vehicles in bottom 30% of ROI),
            "density_score":   float (0–100),
            "congestion_level": str  (Low/Medium/High/Critical),
            "flagged":         bool  (True if density_score > HIGH_DENSITY_THRESHOLD),
          },
          "E": { ... },
          "S": { ... },
          "W": { ... },
          "_summary": {
            "most_congested":  str   (approach label),
            "flagged_approaches": [str],
            "threshold_used":  int,
          }
        }
    """
    roi_area = (frame_width * ROI_FRACTION) * frame_height  # pixels² per approach

    # Step 1 — bucket detections per approach
    approach_data: dict = {a: {"dets": []} for a in APPROACH_LABELS}

    if override_counts is None:
        for det in detections:
            approach = det.get("approach", "N")
            if approach in approach_data:
                approach_data[approach]["dets"].append(det)
    else:
        # override_counts is a {label: count} dict keyed by approach letter or lane idx
        for a in APPROACH_LABELS:
            cnt = override_counts.get(a, 0)
            # synthesise fake dets with no bbox so occupancy = 0
            approach_data[a]["dets"] = [{"bbox": [0, 0, 0, 0], "approach": a}] * int(cnt)

    result: dict = {}

    for approach in APPROACH_LABELS:
        dets   = approach_data[approach]["dets"]
        count  = len(dets)

        # Step 2a — occupancy: total bbox area vs ROI area
        total_bbox_area = sum(_bbox_area(d["bbox"]) for d in dets if "bbox" in d)
        occupancy_ratio = min(1.0, total_bbox_area / roi_area) if roi_area > 0 else 0.0

        # Step 2b — queue length heuristic: vehicles whose bbox bottom is in
        #           the lower 30% of the frame (close to stop-line)
        stop_line_y = frame_height * 0.70
        queue_length = sum(
            1 for d in dets
            if "bbox" in d and len(d["bbox"]) == 4 and d["bbox"][3] >= stop_line_y
        )

        # Step 2c — normalised density score (0–100)
        count_score      = min(1.0, count / MAX_EXPECTED_VEHICLES)
        density_score_01 = (COUNT_WEIGHT * count_score) + (OCCUPANCY_WEIGHT * occupancy_ratio)
        density_score    = round(min(100.0, density_score_01 * 100), 1)

        # Step 3 — congestion level label
        if density_score < 25:
            congestion_level = "Low"
        elif density_score < 50:
            congestion_level = "Medium"
        elif density_score < HIGH_DENSITY_THRESHOLD:
            congestion_level = "High"
        else:
            congestion_level = "Critical"

        # Step 4 — flag high-traffic approaches
        flagged = density_score > HIGH_DENSITY_THRESHOLD

        result[approach] = {
            "count":            count,
            "occupancy_ratio":  round(occupancy_ratio, 4),
            "queue_length":     queue_length,
            "density_score":    density_score,
            "congestion_level": congestion_level,
            "flagged":          flagged,
        }

    # Step 3 — identify most congested approach
    most_congested = max(APPROACH_LABELS, key=lambda a: result[a]["density_score"])
    flagged_approaches = [a for a in APPROACH_LABELS if result[a]["flagged"]]

    result["_summary"] = {
        "most_congested":    most_congested,
        "flagged_approaches": flagged_approaches,
        "threshold_used":    HIGH_DENSITY_THRESHOLD,
    }

    return result


def density_state_vector(approach_densities: dict) -> list:
    """
    Flatten approach density scores into a list [d_N, d_E, d_S, d_W].
    Used by Algorithm 3 as part of the state vector S_t.
    """
    return [approach_densities.get(a, {}).get("density_score", 0.0)
            for a in APPROACH_LABELS]
