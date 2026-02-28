import os
import shutil
import tempfile
import threading
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from config import get_settings
from models.schemas import (
    ExtractRequest,
    ExtractResponse,
    JobStatusResponse,
    VideoMeta,
    FrameInfo,
)
from services.downloader import Downloader
from services.scene_detector import SceneDetector
from services.frame_extractor import FrameExtractor
from services.storage_factory import get_storage

router = APIRouter(tags=["extract"])

# In-memory job store (replace with DB/Redis in production)
_jobs: dict[str, dict] = {}


def _process_video(job_id: str, request: ExtractRequest):
    """Process video: download → detect scenes → extract frames → upload to GCS."""
    settings = get_settings()
    tmpdir = tempfile.mkdtemp(prefix="mv-frame-")

    try:
        _jobs[job_id]["status"] = "downloading"

        # 1. Download video
        downloader = Downloader(max_duration=settings.video_max_duration)
        video_info = downloader.download(request.youtube_url, output_dir=tmpdir)

        _jobs[job_id]["status"] = "detecting_scenes"
        _jobs[job_id]["video_info"] = {
            "title": video_info.title,
            "duration": video_info.duration,
            "channel": video_info.channel,
            "video_id": video_info.video_id,
        }

        # 2. Detect scenes
        detector = SceneDetector(threshold=request.scene_threshold)
        scenes = detector.detect_top_scenes(
            video_info.filepath, max_scenes=request.max_frames
        )

        if not scenes:
            raise RuntimeError("No scenes detected in video")

        _jobs[job_id]["status"] = "extracting_frames"

        # 3. Extract frames
        frames_dir = os.path.join(tmpdir, "frames")
        os.makedirs(frames_dir, exist_ok=True)

        extractor = FrameExtractor()
        extracted = extractor.extract_at_timestamps(
            video_info.filepath, scenes, frames_dir
        )

        _jobs[job_id]["status"] = "uploading"

        # 4. Upload to GCS
        storage = get_storage(bucket_name=settings.gcs_bucket_name)
        frame_infos = []

        for frame in extracted:
            blob_name = storage.upload_frame(frame.filepath, job_id, frame.index)
            url = storage.get_public_url(blob_name)
            frame_infos.append(
                {
                    "index": frame.index,
                    "timestamp": frame.timestamp,
                    "url": url,
                    "width": frame.width,
                    "height": frame.height,
                }
            )

        # 5. Write manifest
        manifest = {
            "job_id": job_id,
            "video_info": _jobs[job_id]["video_info"],
            "frames": frame_infos,
            "total_frames": len(frame_infos),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }
        storage.write_manifest(job_id, manifest)

        # 6. Update job status
        _jobs[job_id]["status"] = "completed"
        _jobs[job_id]["frames"] = frame_infos
        _jobs[job_id]["total_frames"] = len(frame_infos)
        _jobs[job_id]["completed_at"] = datetime.now(timezone.utc)

    except Exception as e:
        _jobs[job_id]["status"] = "failed"
        _jobs[job_id]["error"] = str(e)

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


@router.post("/extract", response_model=ExtractResponse, status_code=202)
async def extract_frames(request: ExtractRequest):
    """Start a frame extraction job from a YouTube video."""
    # Validate URL
    if not Downloader.validate_url(request.youtube_url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    _jobs[job_id] = {
        "status": "queued",
        "created_at": now,
        "video_info": None,
        "frames": [],
        "total_frames": 0,
        "completed_at": None,
        "error": None,
    }

    # Process in a separate thread so the event loop stays responsive
    thread = threading.Thread(
        target=_process_video, args=(job_id, request), daemon=True
    )
    thread.start()

    return ExtractResponse(job_id=job_id, status="queued", created_at=now)


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Get the status and results of a frame extraction job."""
    if job_id not in _jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = _jobs[job_id]

    video_info = None
    if job["video_info"]:
        video_info = VideoMeta(**job["video_info"])

    frames = [FrameInfo(**f) for f in job["frames"]]

    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        video_info=video_info,
        frames=frames,
        total_frames=job["total_frames"],
        created_at=job["created_at"],
        completed_at=job["completed_at"],
        error=job.get("error"),
    )
