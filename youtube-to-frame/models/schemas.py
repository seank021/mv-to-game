from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl


class ExtractRequest(BaseModel):
    youtube_url: str = Field(..., description="YouTube video URL")
    max_frames: int = Field(default=20, ge=1, le=50, description="Maximum frames to extract")
    scene_threshold: float = Field(default=30.0, ge=5.0, le=90.0, description="Scene detection sensitivity")


class FrameInfo(BaseModel):
    index: int
    timestamp: float
    url: str
    width: int
    height: int


class VideoMeta(BaseModel):
    title: str
    duration: int
    channel: str
    video_id: str


class ExtractResponse(BaseModel):
    job_id: str
    status: str  # "processing" | "completed" | "failed"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    video_info: VideoMeta | None = None
    frames: list[FrameInfo] = []
    total_frames: int = 0
    created_at: datetime | None = None
    completed_at: datetime | None = None
    error: str | None = None


class ErrorResponse(BaseModel):
    detail: str
