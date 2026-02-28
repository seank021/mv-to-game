from dataclasses import dataclass

import cv2

from services.scene_detector import Scene


@dataclass
class ExtractedFrame:
    index: int
    timestamp: float
    filepath: str
    width: int
    height: int


class FrameExtractor:
    def extract_at_timestamps(
        self, video_path: str, scenes: list[Scene], output_dir: str
    ) -> list[ExtractedFrame]:
        """Extract a frame at the midpoint of each scene."""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise RuntimeError(f"Failed to open video: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        frames: list[ExtractedFrame] = []

        try:
            for scene in scenes:
                frame_number = int(scene.mid_time * fps)
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
                ret, frame = cap.read()

                if not ret:
                    continue

                filepath = f"{output_dir}/scene_{scene.index:03d}.png"
                cv2.imwrite(filepath, frame)

                h, w = frame.shape[:2]
                frames.append(
                    ExtractedFrame(
                        index=scene.index,
                        timestamp=scene.mid_time,
                        filepath=filepath,
                        width=w,
                        height=h,
                    )
                )
        finally:
            cap.release()

        return frames
