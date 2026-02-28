import os
import tempfile
from dataclasses import dataclass

import yt_dlp


@dataclass
class VideoInfo:
    title: str
    duration: int
    channel: str
    video_id: str
    filepath: str


class Downloader:
    def __init__(self, max_duration: int = 600):
        self.max_duration = max_duration

    def _base_opts(self) -> dict:
        """Return base yt-dlp options."""
        opts = {
            "quiet": True,
            "no_warnings": True,
        }

        # Add cookiefile if environment variable is set
        cookie_file = os.environ.get("COOKIE_FILE")
        if cookie_file:
            opts["cookiefile"] = cookie_file

        return opts

    def download(self, youtube_url: str, output_dir: str | None = None) -> VideoInfo:
        """Download a YouTube video and return its info."""
        # First, extract info without downloading to validate
        info = self._extract_info(youtube_url)

        if info["duration"] and info["duration"] > self.max_duration:
            raise ValueError(
                f"Video duration ({info['duration']}s) exceeds limit ({self.max_duration}s)"
            )

        # Download
        if output_dir is None:
            output_dir = tempfile.mkdtemp(prefix="mv-frame-")

        filepath = os.path.join(output_dir, "video.mp4")
        ydl_opts = self._base_opts()
        ydl_opts.update({
            "format": "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best",
            "merge_output_format": "mp4",
            "outtmpl": filepath,
        })

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])

        return VideoInfo(
            title=info.get("title", "Unknown"),
            duration=info.get("duration", 0),
            channel=info.get("channel", info.get("uploader", "Unknown")),
            video_id=info.get("id", ""),
            filepath=filepath,
        )

    def _extract_info(self, youtube_url: str) -> dict:
        """Extract video metadata without downloading."""
        ydl_opts = self._base_opts()
        ydl_opts["extract_flat"] = False
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(youtube_url, download=False)

    @staticmethod
    def validate_url(url: str) -> bool:
        """Check if the URL is a valid YouTube URL."""
        import re
        pattern = r"^(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/|youtube\.com/shorts/)[\w-]+"
        return bool(re.match(pattern, url))
