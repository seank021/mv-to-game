import os


def get_storage(bucket_name: str = ""):
    """Return LocalStorage for local dev, GCSStorage for production."""
    if os.environ.get("USE_GCS", "").lower() in ("1", "true", "yes"):
        from services.storage import GCSStorage
        return GCSStorage(bucket_name=bucket_name)
    else:
        from services.local_storage import LocalStorage
        base_dir = os.environ.get("FRAMES_DIR", "extracted_frames")
        return LocalStorage(base_dir=base_dir)
