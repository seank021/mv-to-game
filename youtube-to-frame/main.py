import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import extract, health, worker

app = FastAPI(
    title="MV Escape - Frame Extractor",
    description="YouTube MV에서 주요 장면 프레임을 추출하는 API",
    version="0.1.0",
)

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(extract.router, prefix="/api")
app.include_router(worker.router)

# Serve extracted frames locally
frames_dir = os.environ.get("FRAMES_DIR", "extracted_frames")
os.makedirs(frames_dir, exist_ok=True)
app.mount("/frames", StaticFiles(directory=frames_dir), name="frames")
