"""
AI Traffic Analysis System - FastAPI Backend
Run: uvicorn main:app --reload --host 0.0.0.0 --port 8000
Or: python main.py
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn

from database.db import init_db
from routes.upload import router as upload_router
from routes.auth import router as auth_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("Database initialized.")
    yield


app = FastAPI(
    title="Urban Traffic Intelligence - Smart City Traffic Intelligence",
    description="AI-Powered Urban Traffic Intelligence Platform with Vehicle Detection (YOLOv11), Traffic Density Analysis, and Signal Optimization via Multi-Agent RL",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(upload_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "Urban Traffic Intelligence - Traffic Intelligence Platform"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
