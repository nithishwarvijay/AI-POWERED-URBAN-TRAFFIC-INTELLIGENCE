# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Text, Boolean
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/traffic_db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    """User model for authentication and authorization"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="operator")  # administrator | operator | analyst
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class DetectionResult(Base):
    __tablename__ = "detection_results"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    media_type = Column(String, nullable=False)  # image | video
    total_vehicles = Column(Integer, default=0)
    vehicle_counts = Column(JSON)       # {"car": 3, "bike": 2, ...}
    violations = Column(JSON)           # list of violation dicts
    density_level = Column(String)      # Low | Medium | High
    processed_path = Column(String)     # path to annotated output
    lane_counts = Column(JSON)          # {lane1: N, lane2: N, ...}
    signal_timing = Column(JSON)        # {lane1: {signal, time}, ...}
    emergency_status = Column(JSON)     # {emergency: bool, message: str}
    traffic_alert = Column(JSON)        # {alert: str, level: str}
    # ── Additive: Algorithm 2 + 3 outputs (never break existing dashboard) ──
    approach_densities = Column(JSON)       # {N:{score,level,...}, E:..., S:..., W:...}
    rl_signal_decision = Column(JSON)       # Algorithm 3 decision dict
    created_at = Column(DateTime, default=datetime.utcnow)


class ViolationLog(Base):
    __tablename__ = "violation_logs"

    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(Integer, nullable=False)
    violation_type = Column(String, nullable=False)
    confidence = Column(Float)
    frame_number = Column(Integer, default=0)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class SignalDecision(Base):
    """
    Algorithm 3 — decision log table.
    Every RL signal decision is persisted here so the dashboard can replay
    reasoning (state, action, reward, Q-values).
    """
    __tablename__ = "signal_decisions"

    id              = Column(Integer, primary_key=True, index=True)
    intersection_id = Column(String, nullable=False, default="main")
    phase           = Column(String, nullable=False)        # NS_GREEN | EW_GREEN
    green_approaches = Column(Text)                         # JSON list
    red_approaches  = Column(Text)                          # JSON list
    green_time_s    = Column(Integer, default=0)
    state_vector    = Column(Text)                          # JSON [d_N, d_E, d_S, d_W, p]
    q_values        = Column(Text)                          # JSON {phase: Q-value}
    reward          = Column(Float, default=0.0)
    reason          = Column(Text)
    approach_densities = Column(Text)                       # JSON per-approach density
    created_at      = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    # Add new columns to existing tables if they don't exist (SQLite migration)
    _migrate_add_columns()


def _migrate_add_columns():
    """
    Additive schema migration — never drops or renames existing columns.
    Safe to run on existing databases; errors are silently ignored (column
    already exists is the expected error on repeat runs).
    """
    new_columns = [
        # Pre-existing columns (kept for safety in case of older DB)
        ("detection_results", "lane_counts",        "TEXT"),
        ("detection_results", "signal_timing",       "TEXT"),
        ("detection_results", "emergency_status",    "TEXT"),
        ("detection_results", "traffic_alert",       "TEXT"),
        # New: Algorithm 2 + 3 additive columns
        ("detection_results", "approach_densities",  "TEXT"),
        ("detection_results", "rl_signal_decision",  "TEXT"),
    ]
    with engine.connect() as conn:
        for table, col, col_type in new_columns:
            try:
                conn.execute(
                    __import__("sqlalchemy").text(
                        f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"
                    )
                )
                conn.commit()
            except Exception:
                pass  # Column already exists — expected on repeat startup
