import sys
import json
import os
import re
from dotenv import load_dotenv
from google import genai
from google.genai.types import Part

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API not found in .env", file=sys.stderr)
    sys.exit(1)

client = genai.Client(api_key=GEMINI_API_KEY)
MODEL = "gemini-2.5-flash"

PROMPT = """You are analyzing a K-pop music video to generate game data for an escape room game. Watch the entire video carefully and produce a JSON response with exactly this structure:

{
  "mv_id": "<youtube_video_id>",
  "title": "<song title>",
  "artist": "<artist/group name>",
  "audio_url": "<full youtube url>",
  "duration_seconds": <total video length in seconds>,
  "bpm": <estimated BPM of the song>,
  "map": {
    "zones": [
      {
        "zone_id": "<short snake_case id for this zone, e.g. dark_mansion>",
        "member_name": "<member assigned to this zone>",
        "background_pixel_art_url": "",
        "background_timestamp": "MM:SS",
        "width": 800,
        "height": 600,
        "connections": [
          { "to_zone": "<zone_id of adjacent zone>", "edge": "<left|right|top|bottom>", "position_y": 300 }
        ],
        "member_position": { "x": 400, "y": 300 },
        "object_positions": [
          { "label": "<object name>", "x": 150, "y": 300, "is_key_object": true }
        ]
      }
    ],
    "spawn_zone": "<zone_id where player starts>",
    "player_start_position": { "x": 100, "y": 400 }
  },
  "members": [
    {
      "name": "<member name>",
      "profile_photo_url": "",
      "pixel_avatar_url": "",
      "room": {
        "storyline": "<this member's individual storyline/narrative in the MV>",
        "background_pixel_art_url": "",
        "background_timestamp": "MM:SS",
        "original_scene_url": "",
        "objects": [
          { "label": "<object name>", "bbox": [0, 0, 0, 0], "is_key_object": true },
          { "label": "<object name>", "bbox": [0, 0, 0, 0], "is_key_object": false }
        ],
        "quiz": {
          "question": "<short fun quiz question about this member>",
          "type": "multiple_choice",
          "options": ["<option1>", "<option2>", "<option3>", "<option4>"],
          "answer": "<correct option>"
        },
        "chat_persona_prompt": "<persona prompt for LLM chat as this member. describe their situation, personality, and how they speak>"
      }
    }
  ]
}

Rules:
- Identify the 4 main members featured in the MV
- Each member gets exactly 1 zone and 1 room entry
- ALL text must be in English
- background_timestamp: pick the most iconic/representative frame of that member — the member SHOULD be visible in this frame. Choose their most visually striking moment
- objects: pick 2-3 symbolic objects visible in that member's scenes. One must be is_key_object=true
- quiz: keep it short and fun like a game. One short sentence max for the question. Options should be 1-3 words each. Think arcade-style, not essay-style
- chat_persona_prompt: write it as if instructing an LLM to roleplay as that member trapped in their room
- zones should be connected to each other in a logical layout (linear chain is fine)
- bpm: estimate the song's tempo
- Leave all URL fields as empty strings ""
- Leave all bbox values as [0, 0, 0, 0] (will be filled later)
- spawn_zone should be the first zone

Return ONLY valid JSON, no markdown fences or extra text."""


def analyze_mv(youtube_url: str) -> dict:
    response = client.models.generate_content(
        model=MODEL,
        contents=[
            Part.from_uri(file_uri=youtube_url, mime_type="video/mp4"),
            PROMPT,
        ],
    )

    text = response.text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    if text.startswith("json"):
        text = text[4:]

    return json.loads(text.strip())


def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze_mv.py <youtube_url>", file=sys.stderr)
        print("Example: python analyze_mv.py https://www.youtube.com/watch?v=dQw4w9WgXcQ", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]
    print(f"Analyzing music video: {url}", file=sys.stderr)
    print("This may take a minute...", file=sys.stderr)

    result = analyze_mv(url)

    # Extract video ID from URL for the filename and enforce correct values
    match = re.search(r"(?:v=|youtu\.be/)([\w-]+)", url)
    video_id = match.group(1) if match else "output"
    result["mv_id"] = video_id
    result["audio_url"] = url
    output_path = os.path.join(os.path.dirname(__file__), "mvstoryline.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Saved to {output_path}", file=sys.stderr)


if __name__ == "__main__":
    main()
