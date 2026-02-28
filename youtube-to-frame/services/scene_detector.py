from dataclasses import dataclass

from scenedetect import open_video, SceneManager
from scenedetect.detectors import ContentDetector


@dataclass
class Scene:
    index: int
    start_time: float
    end_time: float
    mid_time: float
    duration: float


class SceneDetector:
    def __init__(self, threshold: float = 30.0, min_scene_len: int = 15):
        self.threshold = threshold
        self.min_scene_len = min_scene_len  # minimum frames per scene

    def detect(self, video_path: str) -> list[Scene]:
        """Detect scene changes in a video file."""
        video = open_video(video_path)
        scene_manager = SceneManager()
        scene_manager.add_detector(
            ContentDetector(threshold=self.threshold, min_scene_len=self.min_scene_len)
        )

        scene_manager.detect_scenes(video, show_progress=False)
        scene_list = scene_manager.get_scene_list()

        scenes = []
        for i, (start, end) in enumerate(scene_list):
            start_sec = start.get_seconds()
            end_sec = end.get_seconds()
            scenes.append(
                Scene(
                    index=i,
                    start_time=start_sec,
                    end_time=end_sec,
                    mid_time=(start_sec + end_sec) / 2,
                    duration=end_sec - start_sec,
                )
            )

        return scenes

    def detect_top_scenes(self, video_path: str, max_scenes: int = 20) -> list[Scene]:
        """Detect scenes and return the top N by duration (longer = more significant)."""
        scenes = self.detect(video_path)

        if len(scenes) <= max_scenes:
            return scenes

        # Sort by duration (longer scenes are typically more significant backgrounds)
        sorted_scenes = sorted(scenes, key=lambda s: s.duration, reverse=True)
        top_scenes = sorted_scenes[:max_scenes]

        # Re-sort by time order
        top_scenes.sort(key=lambda s: s.start_time)

        # Re-index
        for i, scene in enumerate(top_scenes):
            scene.index = i

        return top_scenes
