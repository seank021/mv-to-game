import json
import os
import shutil


class LocalStorage:
    """Local filesystem storage for development. Mirrors GCSStorage interface."""

    def __init__(self, base_dir: str = "extracted_frames"):
        self.base_dir = base_dir
        os.makedirs(base_dir, exist_ok=True)

    def upload_frame(self, local_path: str, job_id: str, index: int) -> str:
        """Copy a frame to local storage. Returns the relative path."""
        job_dir = os.path.join(self.base_dir, job_id)
        os.makedirs(job_dir, exist_ok=True)
        blob_name = f"{job_id}/scene_{index:03d}.png"
        dest = os.path.join(self.base_dir, blob_name)
        shutil.copy2(local_path, dest)
        return blob_name

    def upload_frames(self, frame_paths: list[tuple[str, int]], job_id: str) -> list[str]:
        blob_names = []
        for local_path, index in frame_paths:
            blob_name = self.upload_frame(local_path, job_id, index)
            blob_names.append(blob_name)
        return blob_names

    def write_manifest(self, job_id: str, manifest: dict) -> str:
        job_dir = os.path.join(self.base_dir, job_id)
        os.makedirs(job_dir, exist_ok=True)
        blob_name = f"{job_id}/manifest.json"
        filepath = os.path.join(self.base_dir, blob_name)
        with open(filepath, "w") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
        return blob_name

    def read_manifest(self, job_id: str) -> dict | None:
        filepath = os.path.join(self.base_dir, job_id, "manifest.json")
        if not os.path.exists(filepath):
            return None
        with open(filepath) as f:
            return json.load(f)

    def get_public_url(self, blob_name: str) -> str:
        """Return a URL that the local FastAPI server can serve."""
        return f"/frames/{blob_name}"

    def job_exists(self, job_id: str) -> bool:
        return os.path.exists(os.path.join(self.base_dir, job_id, "manifest.json"))
