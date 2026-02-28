import json

from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2


class TaskQueue:
    def __init__(self, project_id: str, region: str, queue_name: str, worker_url: str):
        self.client = tasks_v2.CloudTasksClient()
        self.parent = self.client.queue_path(project_id, region, queue_name)
        self.worker_url = worker_url

    def enqueue_extraction(self, job_id: str, youtube_url: str, max_frames: int = 20, scene_threshold: float = 30.0) -> str:
        """Enqueue a frame extraction task. Returns the task name."""
        payload = {
            "job_id": job_id,
            "youtube_url": youtube_url,
            "max_frames": max_frames,
            "scene_threshold": scene_threshold,
        }

        task = {
            "http_request": {
                "http_method": tasks_v2.HttpMethod.POST,
                "url": f"{self.worker_url}/worker/process",
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(payload).encode(),
            }
        }

        response = self.client.create_task(
            parent=self.parent,
            task=task,
        )

        return response.name
