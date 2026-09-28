"""
Algorithm 3 — Signal Optimization via Multi-Agent RL
======================================================
Paper mapping:
  Step 1: Observe current traffic state
            S_t = {d_N, d_E, d_S, d_W, p_t}
            (per-approach density scores from Alg 2 + current phase index)
  Step 2: Select traffic signal action A_t
            Phase options: "NS_GREEN" (N+S get green, E+W red)
                           "EW_GREEN" (E+W get green, N+S red)
            Each intersection is an independent RL agent — the design
            generalises to multi-intersection (multi-agent) later.
  Step 3: Evaluate reward
            R_t = -α·W_t - β·Q_t + γ·F_t
            where:
              W_t = normalised waiting time proxy (sum of red-phase densities)
              Q_t = normalised queue length (sum of queue lengths)
              F_t = throughput proxy (density reduction on green phases)
            Weights α, β, γ are configurable.
            NOTE: Emergency term δ·E_t is out of scope (Algorithm 4).
  Step 4: Update Q-table (tabular Q-learning on discretised state)
  Step 5: Log decision (state, action, reward, phase_durations, timestamp)
           to `signal_decisions` DB table for dashboard replay

Architecture:
  SignalOptimizer           — public facade; call .decide() per analysis
  TabularQLearningPolicy    — first working policy (Q-table, 2 actions)
  PolicyBase                — abstract interface; swap policy without touching
                              the rest of the pipeline
  SafetyLayer               — enforces minimum green time, no illegal switches;
                              clamps/rejects unsafe RL actions before they apply
  get_signal_optimizer()    — module-level singleton factory
"""

import json
import math
import random
import time
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import Optional

from ml.density import density_state_vector, APPROACH_LABELS

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# RL reward weights  (R_t = -α W_t - β Q_t + γ F_t)
ALPHA = 0.4    # waiting time penalty weight
BETA  = 0.3    # queue length penalty weight
GAMMA = 0.3    # throughput reward weight

# Q-learning hyper-parameters
LEARNING_RATE    = 0.1
DISCOUNT_FACTOR  = 0.9
EPSILON_START    = 0.5    # initial exploration rate
EPSILON_MIN      = 0.05   # minimum exploration rate
EPSILON_DECAY    = 0.995  # per-update decay

# State discretisation: density buckets
DENSITY_BUCKETS = [0, 25, 50, 75, 100]   # bucket edges → 4 levels per approach

# Safety constraints
MIN_GREEN_TIME   = 10     # seconds — hard minimum per phase
MAX_GREEN_TIME   = 90     # seconds — hard maximum per phase
MIN_PHASE_HOLD   = 1      # minimum number of decisions before phase switch

# Phase definitions
PHASES = {
    "NS_GREEN": {"green": ["N", "S"], "red": ["E", "W"]},
    "EW_GREEN": {"green": ["E", "W"], "red": ["N", "S"]},
}
PHASE_LIST = list(PHASES.keys())

# Q-table persistence (JSON so it survives server restarts)
_QTABLE_PATH = Path(__file__).parent.parent / "signal_qtable.json"


# ---------------------------------------------------------------------------
# Policy interface
# ---------------------------------------------------------------------------

class PolicyBase(ABC):
    """Swappable policy interface for Algorithm 3."""

    @abstractmethod
    def select_action(self, state: tuple) -> str:
        """Return a phase string from PHASE_LIST."""

    @abstractmethod
    def update(self, state: tuple, action: str, reward: float, next_state: tuple) -> None:
        """Update policy from a (s, a, r, s') transition."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable policy name."""


# ---------------------------------------------------------------------------
# Tabular Q-learning policy (Algorithm 3 first working implementation)
# ---------------------------------------------------------------------------

class TabularQLearningPolicy(PolicyBase):
    """
    Algorithm 3 Step 4 — Tabular Q-learning.

    State: tuple of per-approach density bucket indices + current phase index
           (len = 5 for 4 approaches + 1 phase)
    Actions: PHASE_LIST  ["NS_GREEN", "EW_GREEN"]
    Q-table: dict mapping state-tuple → {action: Q-value}
    """

    def __init__(self):
        self.q: dict = {}
        self._epsilon = EPSILON_START
        self._load()

    # ---- Q-table helpers ------------------------------------------------

    def _q_values(self, state: tuple) -> dict:
        if state not in self.q:
            self.q[state] = {phase: 0.0 for phase in PHASE_LIST}
        return self.q[state]

    def _best_action(self, state: tuple) -> str:
        qv = self._q_values(state)
        return max(qv, key=qv.__getitem__)

    # ---- PolicyBase implementation ---------------------------------------

    @property
    def name(self) -> str:
        return "TabularQLearning"

    def select_action(self, state: tuple) -> str:
        """ε-greedy exploration / exploitation."""
        if random.random() < self._epsilon:
            return random.choice(PHASE_LIST)
        return self._best_action(state)

    def update(self, state: tuple, action: str, reward: float, next_state: tuple) -> None:
        """
        Algorithm 3 Step 4 — Bellman update:
          Q(s, a) ← Q(s, a) + α [r + γ·max_a' Q(s', a') - Q(s, a)]
        """
        q_sa   = self._q_values(state)[action]
        q_next = max(self._q_values(next_state).values())
        td     = reward + DISCOUNT_FACTOR * q_next - q_sa
        self.q[state][action] = q_sa + LEARNING_RATE * td

        # Decay epsilon
        self._epsilon = max(EPSILON_MIN, self._epsilon * EPSILON_DECAY)
        self._save()

    # ---- Persistence (survives server restart) ---------------------------

    def _load(self):
        try:
            if _QTABLE_PATH.exists():
                raw = json.loads(_QTABLE_PATH.read_text())
                # JSON keys are strings; convert back to tuples
                self.q = {
                    tuple(json.loads(k)): v
                    for k, v in raw.get("q", {}).items()
                }
                self._epsilon = raw.get("epsilon", EPSILON_START)
        except Exception:
            self.q = {}
            self._epsilon = EPSILON_START

    def _save(self):
        try:
            _QTABLE_PATH.write_text(json.dumps({
                "q": {json.dumps(list(k)): v for k, v in self.q.items()},
                "epsilon": self._epsilon,
            }, indent=2))
        except Exception:
            pass   # non-fatal; Q-table will be rebuilt next run


# ---------------------------------------------------------------------------
# Safety layer
# ---------------------------------------------------------------------------

class SafetyLayer:
    """
    Enforce minimum green time and no illegal phase switches.
    Wraps any policy and clamps/rejects unsafe RL actions.
    """

    def __init__(self):
        self._current_phase: str = PHASE_LIST[0]
        self._phase_hold_count: int = 0

    def enforce(self, proposed_action: str, emergency_status: dict) -> tuple[str, list[str]]:
        """
        Returns (safe_action, list_of_reasons).

        Rules:
          1. Emergency override: if emergency detected, force the phase that
             gives green to the approach containing the emergency vehicle.
             (Emergency *routing* is Algorithm 4; here we just ensure RL
             does not flip away from the emergency lane during a crisis.)
          2. Minimum phase hold: don't switch phases more often than
             MIN_PHASE_HOLD decisions to prevent thrashing.
        """
        reasons: list[str] = []

        # Rule 1 — emergency gate (Algorithm 4 stub: keep safe pass-through)
        if emergency_status.get("emergency"):
            emrg_approach = emergency_status.get("lane", "")
            # Map lane string ("lane1"…"lane4") to approach letter
            lane_to_approach = {"lane1": "N", "lane2": "E", "lane3": "S", "lane4": "W"}
            approach = lane_to_approach.get(emrg_approach, "")
            for phase, config in PHASES.items():
                if approach in config["green"]:
                    proposed_action = phase
                    reasons.append(f"Safety: emergency in {approach} → forced {phase}")
                    break

        # Rule 2 — minimum hold (prevent thrashing)
        if (proposed_action != self._current_phase
                and self._phase_hold_count < MIN_PHASE_HOLD):
            proposed_action = self._current_phase
            reasons.append(
                f"Safety: phase hold ({self._phase_hold_count} < {MIN_PHASE_HOLD})"
            )

        # Update tracking
        if proposed_action == self._current_phase:
            self._phase_hold_count += 1
        else:
            self._phase_hold_count = 0
            self._current_phase = proposed_action

        return proposed_action, reasons


# ---------------------------------------------------------------------------
# State encoding helpers
# ---------------------------------------------------------------------------

def _discretise_density(score: float) -> int:
    """Map a density score 0–100 to a bucket index 0–3."""
    for i, edge in enumerate(DENSITY_BUCKETS[1:]):
        if score <= edge:
            return i
    return len(DENSITY_BUCKETS) - 2


def _encode_state(density_vector: list, current_phase: str) -> tuple:
    """
    Algorithm 3 Step 1 — Encode S_t = {d_N, d_E, d_S, d_W, p_t}.
    Discretises continuous density scores into bucket indices.
    """
    buckets = tuple(_discretise_density(d) for d in density_vector)
    phase_idx = PHASE_LIST.index(current_phase) if current_phase in PHASE_LIST else 0
    return buckets + (phase_idx,)


# ---------------------------------------------------------------------------
# Reward function
# ---------------------------------------------------------------------------

def _compute_reward(
    prev_densities: list,
    next_densities: list,
    action: str,
    approach_densities: dict,
) -> tuple[float, dict]:
    """
    Algorithm 3 Step 3 — Reward function:
      R_t = -α·W_t - β·Q_t + γ·F_t

    W_t = normalised total density on red approaches (proxy for waiting time)
    Q_t = normalised total queue length on red approaches
    F_t = density reduction on green approaches (proxy for throughput)
    """
    green_approaches = PHASES[action]["green"]
    red_approaches   = PHASES[action]["red"]

    # W_t — waiting time proxy (sum of red-approach density scores / 200)
    w_t = sum(
        approach_densities.get(a, {}).get("density_score", 0.0)
        for a in red_approaches
    ) / 200.0   # normalise (max possible = 2×100)

    # Q_t — queue length proxy
    total_queue = sum(
        approach_densities.get(a, {}).get("queue_length", 0)
        for a in red_approaches
    )
    q_t = min(1.0, total_queue / 20.0)   # normalise at 20 queued vehicles

    # F_t — throughput: density reduction on green approaches
    green_prev = sum(p for p, a in zip(prev_densities, APPROACH_LABELS)
                     if a in green_approaches)
    green_next = sum(n for n, a in zip(next_densities, APPROACH_LABELS)
                     if a in green_approaches)
    f_t = max(0.0, (green_prev - green_next) / 200.0)

    reward = -ALPHA * w_t - BETA * q_t + GAMMA * f_t

    components = {
        "W_t": round(w_t, 4),
        "Q_t": round(q_t, 4),
        "F_t": round(f_t, 4),
        "reward": round(reward, 6),
    }
    return reward, components


# ---------------------------------------------------------------------------
# Green-time calculation from density
# ---------------------------------------------------------------------------

def _green_time(approach_densities: dict, green_approaches: list) -> int:
    """
    Compute green phase duration (seconds) proportional to congestion.
    Clamped to [MIN_GREEN_TIME, MAX_GREEN_TIME].
    """
    avg_density = sum(
        approach_densities.get(a, {}).get("density_score", 0.0)
        for a in green_approaches
    ) / max(len(green_approaches), 1)

    # Linear interpolation: 0 density → MIN, 100 density → MAX
    t = (avg_density / 100.0) * (MAX_GREEN_TIME - MIN_GREEN_TIME) + MIN_GREEN_TIME
    return int(max(MIN_GREEN_TIME, min(MAX_GREEN_TIME, t)))


# ---------------------------------------------------------------------------
# SignalOptimizer — public facade
# ---------------------------------------------------------------------------

class SignalOptimizer:
    """
    Algorithm 3 facade.  Call .decide(approach_densities, emergency_status)
    after every Algorithm 2 pass.  Thread-safe single-intersection version;
    extend to multi-agent by instantiating one optimizer per intersection_id.
    """

    def __init__(self, policy: PolicyBase = None, intersection_id: str = "main"):
        self._policy       = policy or TabularQLearningPolicy()
        self._safety       = SafetyLayer()
        self._intersection = intersection_id
        self._prev_state: Optional[tuple] = None
        self._prev_action: Optional[str]  = None
        self._prev_densities: list = [0.0] * 4

    def decide(
        self,
        approach_densities: dict,
        emergency_status: dict = None,
    ) -> dict:
        """
        Algorithm 3 Steps 1–5.

        Args:
            approach_densities: output of Algorithm 2 (ml.density)
            emergency_status:   output of detect_emergency_vehicles()

        Returns decision dict logged to DB and returned in API response:
          {
            "phase":          str  — "NS_GREEN" | "EW_GREEN"
            "green_approaches": [str]
            "red_approaches":   [str]
            "green_time_s":   int  — computed green duration (seconds)
            "reason":         str  — human-readable explanation
            "safety_notes":   [str]
            "reward_components": {...}
            "q_values":       dict — current Q-values for this state
            "epsilon":        float — current exploration rate
            "intersection_id": str
          }
        """
        if emergency_status is None:
            emergency_status = {"emergency": False}

        # Step 1 — encode state S_t
        density_vec = density_state_vector(approach_densities)
        current_phase = self._safety._current_phase
        state = _encode_state(density_vec, current_phase)

        # RL update from previous transition if we have one
        if self._prev_state is not None and self._prev_action is not None:
            reward, reward_components = _compute_reward(
                self._prev_densities, density_vec,
                self._prev_action, approach_densities,
            )
            self._policy.update(self._prev_state, self._prev_action, reward, state)
        else:
            reward_components = {"W_t": 0, "Q_t": 0, "F_t": 0, "reward": 0}

        # Step 2 — select action A_t (policy)
        raw_action = self._policy.select_action(state)

        # Safety layer — clamp/reject unsafe actions
        safe_action, safety_notes = self._safety.enforce(raw_action, emergency_status)

        # Compute green time
        green_approaches = PHASES[safe_action]["green"]
        red_approaches   = PHASES[safe_action]["red"]
        green_time = _green_time(approach_densities, green_approaches)

        # Build human-readable reason
        most_congested = approach_densities.get("_summary", {}).get("most_congested", "?")
        flagged        = approach_densities.get("_summary", {}).get("flagged_approaches", [])
        reason = (
            f"Phase {safe_action}: green on {green_approaches}, "
            f"most congested approach={most_congested}, "
            f"flagged={flagged or 'none'}"
        )

        # Q-values snapshot for transparency
        q_values = {}
        if hasattr(self._policy, "_q_values"):
            q_values = {k: round(v, 4) for k, v in self._policy._q_values(state).items()}

        epsilon = getattr(self._policy, "_epsilon", None)

        decision = {
            "phase":             safe_action,
            "green_approaches":  green_approaches,
            "red_approaches":    red_approaches,
            "green_time_s":      green_time,
            "reason":            reason,
            "safety_notes":      safety_notes,
            "reward_components": reward_components,
            "q_values":          q_values,
            "epsilon":           round(epsilon, 4) if epsilon is not None else None,
            "intersection_id":   self._intersection,
            "timestamp":         datetime.utcnow().isoformat() + "Z",
        }

        # Persist to DB (Step 5) — non-fatal if DB is unavailable
        _persist_decision(decision, state, approach_densities)

        # Store for next update
        self._prev_state    = state
        self._prev_action   = safe_action
        self._prev_densities = density_vec

        return decision


def _persist_decision(decision: dict, state: tuple, approach_densities: dict):
    """
    Algorithm 3 Step 5 — Log decision to signal_decisions table.
    Non-fatal: if DB is not ready the analysis still succeeds.
    """
    try:
        from database.db import SessionLocal, SignalDecision
        db = SessionLocal()
        row = SignalDecision(
            intersection_id     = decision["intersection_id"],
            phase               = decision["phase"],
            green_approaches    = json.dumps(decision["green_approaches"]),
            red_approaches      = json.dumps(decision["red_approaches"]),
            green_time_s        = decision["green_time_s"],
            state_vector        = json.dumps(list(state)),
            q_values            = json.dumps(decision["q_values"]),
            reward              = decision["reward_components"].get("reward", 0.0),
            reason              = decision["reason"],
            approach_densities  = json.dumps({
                k: v for k, v in approach_densities.items() if k != "_summary"
            }),
        )
        db.add(row)
        db.commit()
        db.close()
    except Exception:
        pass   # non-fatal


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

_optimizer: Optional[SignalOptimizer] = None


def get_signal_optimizer(intersection_id: str = "main") -> SignalOptimizer:
    """Return (or create) the module-level SignalOptimizer singleton."""
    global _optimizer
    if _optimizer is None:
        _optimizer = SignalOptimizer(intersection_id=intersection_id)
    return _optimizer
