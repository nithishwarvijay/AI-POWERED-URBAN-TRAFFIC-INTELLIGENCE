# ALGORITHMS_IMPLEMENTED.md

## Overview

This document summarises what was built, what is stubbed, and how to test each algorithm independently.

---

## Algorithm 1 — Vehicle Detection (YOLOv11)

**File:** `backend/ml/detector.py`  
**Upgrade:** `yolov8n.pt` → `yolo11n.pt` (Ultralytics ≥ 8.3.40)  
**Old weights:** `yolov8n.pt` kept on disk for A/B comparison; set `MODEL_PATH=yolov8n.pt` in `.env` to revert.

### What was built
- `TrafficDetector(model_path="yolo11n.pt")` — loads YOLO11 nano automatically on first run (Ultralytics downloads weights)
- `_preprocess()` — OpenCV resize to max 1280px (Algorithm 1 Step 2)
- `detect_vehicles()` — YOLO11 inference + structured output per detection:
  ```json
  {
    "label":        "car",
    "raw_label":    "car",
    "confidence":   0.87,
    "bbox":         [x1, y1, x2, y2],
    "approach":     "N",
    "is_emergency": false
  }
  ```
- `process_image()` + `process_video()` — orchestrate Alg 1 → Alg 2 → Alg 3 pipeline

### Stubbed / limitations
- **Emergency class**: Standard COCO-trained YOLO11 has **no** dedicated ambulance/fire/police class. `is_emergency` is a keyword-heuristic stub only. Do not treat it as a trained classifier result. This stub ensures Algorithm 4 (Emergency Routing) can plug in without breaking the schema.

### Test
```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@/path/to/traffic_image.jpg"
```
Expected response includes: `total_vehicles`, `vehicle_counts`, `approach_densities`, `rl_signal_decision`

---

## Algorithm 2 — Traffic Density Analysis

**File:** `backend/ml/density.py`

### What was built
- `compute_approach_densities(detections, frame_width)` — maps detections to N/E/S/W approaches and computes:
  - `count` — vehicle count per approach
  - `occupancy_ratio` — total bbox area / ROI area (0–1)
  - `queue_length` — vehicles in the bottom 30% of the frame (stop-line heuristic)
  - `density_score` — combined score 0–100:  
    `score = 60% × count_norm + 40% × occupancy_ratio`
  - `congestion_level` — Low / Medium / High / Critical
  - `flagged` — True if `density_score > HIGH_DENSITY_THRESHOLD` (default 70)
- `_summary` — `most_congested` approach, `flagged_approaches` list
- `density_state_vector()` — flattens `[d_N, d_E, d_S, d_W]` for Algorithm 3

### Test
```bash
# After an upload, use the result_id from the response:
curl http://localhost:8000/api/density/1
```
Expected shape:
```json
{
  "result_id": 1,
  "approach_densities": {
    "N": {"count": 3, "occupancy_ratio": 0.12, "queue_length": 1, "density_score": 22.8, "congestion_level": "Low", "flagged": false},
    "E": {...},
    "S": {...},
    "W": {...},
    "_summary": {"most_congested": "S", "flagged_approaches": [], "threshold_used": 70}
  }
}
```

---

## Algorithm 3 — Signal Optimization (Multi-Agent RL)

**File:** `backend/ml/signal_rl.py`

### What was built
- `SignalOptimizer` — public facade; one instance per intersection ID (multi-agent ready)
- `TabularQLearningPolicy` — online Q-learning:
  - **State** `S_t = (bucket_N, bucket_E, bucket_S, bucket_W, phase_idx)` — 4 density buckets × 4 approaches + current phase
  - **Actions** `A_t ∈ {NS_GREEN, EW_GREEN}` — 2-phase intersection control
  - **Bellman update**: `Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') - Q(s,a)]`
  - Q-table persisted to `backend/signal_qtable.json` across restarts
  - ε-greedy exploration (start 0.5, decay 0.995, min 0.05)
- **Reward function** `R_t = -0.4·W_t - 0.3·Q_t + 0.3·F_t`:
  - `W_t` — normalised density on red approaches (waiting time proxy)
  - `Q_t` — normalised queue length on red approaches
  - `F_t` — density reduction on green approaches (throughput proxy)
  - Emergency term `δ·E_t` **excluded** (Algorithm 4 scope)
- `SafetyLayer` — clamps unsafe RL actions:
  - Emergency override: forces green to the approach containing the emergency vehicle
  - Minimum phase hold: prevents thrashing (`MIN_PHASE_HOLD = 1`)
  - Green time clamped to `[10s, 90s]`
- `_persist_decision()` — logs every decision to `signal_decisions` table

### Stubbed / out of scope
- Full SUMO-trained MARL: this is a simplified online tabular Q-learning implementation, not a SUMO-simulated multi-intersection system. The `intersection_id` parameter future-proofs the design for multi-agent extension.
- DQN / deep RL: the `PolicyBase` interface allows swapping in a DQN without touching the rest of the pipeline.

### Test
```bash
# Get the 10 most recent RL decisions with full reasoning:
curl http://localhost:8000/api/signal-decision?limit=10
```
Expected shape:
```json
[
  {
    "id": 1,
    "intersection_id": "main",
    "phase": "NS_GREEN",
    "green_approaches": ["N", "S"],
    "red_approaches": ["E", "W"],
    "green_time_s": 35,
    "state_vector": [1, 0, 2, 1, 0],
    "q_values": {"NS_GREEN": 0.12, "EW_GREEN": -0.03},
    "reward": -0.04,
    "reason": "Phase NS_GREEN: green on ['N', 'S'], most congested approach=S, flagged=none",
    "approach_densities": {...},
    "created_at": "2026-09-05T17:41:00"
  }
]
```

---

## Database Schema Changes (additive only)

| Table | New columns | Notes |
|-------|-------------|-------|
| `detection_results` | `approach_densities TEXT`, `rl_signal_decision TEXT` | JSON fields; old columns untouched |
| `signal_decisions` | **new table** | Full Algorithm 3 decision log |

No existing columns were renamed or dropped.

---

## New API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/density/{result_id}` | Algorithm 2 per-approach density for a result |
| `GET` | `/api/signal-decision?limit=N` | Algorithm 3 recent RL decisions with reasoning |

All existing endpoints (`/api/upload`, `/api/analyze-traffic`, `/api/results`, `/api/stats`, etc.) are unchanged in their response shape — `approach_densities` and `rl_signal_decision` are additive fields.

---

## Algorithm 4 — Out of Scope

Emergency Route Optimization (Algorithm 4) is **not touched**. The existing frontend emergency-trigger demo behavior is preserved. The `is_emergency` stub in Algorithm 1 and the emergency gate in `SafetyLayer` (Algorithm 3) ensure the schema is future-ready for Algorithm 4 integration.
