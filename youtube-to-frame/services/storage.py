import json
from datetime import timedelta

from google.cloud import storage


class GCSStorage:
    def __init__(self, bucket_name: str):
        self.client = storage.Client()
        self.bucket = self.client.bucket(bucket_name)

    def upload_frame(self, local_path: str, job_id: str, index: int) -> str:
        """Upload a frame image to GCS and return the blob name."""
        blob_name = f"{job_id}/scene_{index:03d}.png"
        blob = self.bucket.blob(blob_name)
        blob.upload_from_filename(local_path, content_type="image/png")
        return blob_name

    def upload_frames(
        self, frame_paths: list[tuple[str, int]], job_id: str
    ) -> list[str]:
        """Upload multiple frames. frame_paths is list of (local_path, index)."""
        blob_names = []
        for local_path, index in frame_paths:
            blob_name = self.upload_frame(local_path, job_id, index)
            blob_names.append(blob_name)
        return blob_names

    def write_manifest(self, job_id: str, manifest: dict) -> str:
        """Write job manifest (metadata + frame list) to GCS."""
        blob_name = f"{job_id}/manifest.json"
        blob = self.bucket.blob(blob_name)
        blob.upload_from_string(
            json.dumps(manifest, ensure_ascii=False, indent=2),
            content_type="application/json",
        )
        return blob_name

    def read_manifest(self, job_id: str) -> dict | None:
        """Read job manifest from GCS. Returns None if not found."""
        blob_name = f"{job_id}/manifest.json"
        blob = self.bucket.blob(blob_name)
        if not blob.exists():
            return None
        return json.loads(blob.download_as_text())

    def get_signed_url(
        self, blob_name: str, expiration_minutes: int = 60
    ) -> str:
        """Generate a signed URL for a blob."""
        blob = self.bucket.blob(blob_name)
        return blob.generate_signed_url(
            expiration=timedelta(minutes=expiration_minutes),
            method="GET",
        )

    def get_public_url(self, blob_name: str) -> str:
        """Get the public URL for a blob (bucket must have public access)."""
        return f"https://storage.googleapis.com/{self.bucket.name}/{blob_name}"

    def job_exists(self, job_id: str) -> bool:
        """Check if a job manifest exists."""
        blob = self.bucket.blob(f"{job_id}/manifest.json")
        return blob.exists()
