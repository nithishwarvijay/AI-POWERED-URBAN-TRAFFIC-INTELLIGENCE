"""
AI Traffic Analysis System - FastAPI Backend
Run: uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database.db import init_db
from routes.upload import router as upload_router

load_dotenv()

app = FastAPI(
    title="AI Traffic Analysis System",
    description="Detect vehicles, classify types, and identify traffic violations using YOLOv8",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)


@app.on_event("startup")
def on_startup():
    init_db()
    print("Database initialized.")


@app.get("/health")
def health():
    return {"status": "ok", "service": "AI Traffic Analysis System"}
