import os
import shutil
import tempfile
from datetime import datetime, timezone

from fastapi import APIRouter, Request, HTTPException

from config import get_settings
from services.downloader import Downloader
from services.scene_detector import SceneDetector
from services.frame_extractor import FrameExtractor
from services.storage_factory import get_storage

router = APIRouter(tags=["worker"])


@router.post("/worker/process")
async def process_extraction(request: Request):
    """Worker endpoint called by Cloud Tasks to process a video."""
    # Verify request is from Cloud Tasks (in production, check OIDC token)
    payload = await request.json()

    job_id = payload["job_id"]
    youtube_url = payload["youtube_url"]
    max_frames = payload.get("max_frames", 20)
    scene_threshold = payload.get("scene_threshold", 30.0)

    settings = get_settings()
    tmpdir = tempfile.mkdtemp(prefix="mv-frame-")

    try:
        # 1. Download
        downloader = Downloader(max_duration=settings.video_max_duration)
        video_info = downloader.download(youtube_url, output_dir=tmpdir)

        # 2. Detect scenes
        detector = SceneDetector(threshold=scene_threshold)
        scenes = detector.detect_top_scenes(video_info.filepath, max_scenes=max_frames)

        if not scenes:
            raise RuntimeError("No scenes detected in video")

        # 3. Extract frames
        frames_dir = os.path.join(tmpdir, "frames")
        os.makedirs(frames_dir, exist_ok=True)

        extractor = FrameExtractor()
        extracted = extractor.extract_at_timestamps(
            video_info.filepath, scenes, frames_dir
        )

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
            "video_info": {
                "title": video_info.title,
                "duration": video_info.duration,
                "channel": video_info.channel,
                "video_id": video_info.video_id,
            },
            "frames": frame_infos,
            "total_frames": len(frame_infos),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }
        storage.write_manifest(job_id, manifest)

        return {"status": "completed", "job_id": job_id, "total_frames": len(frame_infos)}

    except Exception as e:
        # Write error manifest so the API can report failure
        storage = get_storage(bucket_name=settings.gcs_bucket_name)
        error_manifest = {
            "job_id": job_id,
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }
        storage.write_manifest(job_id, error_manifest)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)
