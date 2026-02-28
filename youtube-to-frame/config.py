from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    gcp_project_id: str = "molthome-486509"
    gcs_bucket_name: str = "mv-escape-frames"
    gcp_region: str = "asia-northeast3"
    cloud_tasks_queue: str = "frame-extraction"

    max_frames: int = 20
    scene_threshold: float = 30.0
    video_max_duration: int = 600

    api_host: str = "0.0.0.0"
    api_port: int = 8080

    # Storage
    use_gcs: bool = False
    frames_dir: str = "extracted_frames"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
