import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const PROMPT = `You are analyzing a K-pop music video to generate game data for an escape room game. Watch the entire video carefully and produce a JSON response with exactly this structure:

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
- Identify ALL members/performers featured in the MV (solo artists count as 1, groups can have up to 10)
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

Return ONLY valid JSON, no markdown fences or extra text.`;

/** Extract YouTube video ID from URL */
function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API not configured in .env" },
        { status: 500 }
      );
    }

    // Call Gemini with the YouTube video
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { fileData: { fileUri: url, mimeType: "video/mp4" } },
            { text: PROMPT },
          ],
        },
      ],
    });

    let text = response.text?.trim() ?? "";

    // Strip markdown code fences if present (e.g. ```json ... ```)
    const fenceMatch = text.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/);
    if (fenceMatch) {
      text = fenceMatch[1];
    }

    let data;
    try {
      data = JSON.parse(text.trim());
    } catch (parseErr) {
      console.error("Gemini raw response:", text.slice(0, 500));
      throw new Error("Failed to parse Gemini response as JSON");
    }

    // Enforce correct video ID and URL
    data.mv_id = videoId;
    data.audio_url = url;

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Analyze API error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
