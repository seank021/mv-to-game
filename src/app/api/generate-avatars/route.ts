import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const AVATAR_CACHE_DIR = path.join(process.cwd(), "public", "avatars");

const IDENTIFY_PROMPT = `Watch this K-pop music video and identify the group and individual members featured.
Return ONLY valid JSON with this structure:
{
  "group": "<group name>",
  "members": ["<member1>", "<member2>", "<member3>", "<member4>"]
}
Identify the main members (up to 4). Return ONLY JSON, no markdown fences.`;

/** Sanitize name for safe filename */
function toFileName(group: string, name: string): string {
  return `${group}-${name}`.toLowerCase().replace(/[^a-z0-9-]/g, "_");
}

/** Check if a cached avatar exists, return data URL if found */
function getCached(group: string, name: string): string | null {
  const base = toFileName(group, name);
  for (const ext of ["png", "webp", "jpeg"]) {
    const filePath = path.join(AVATAR_CACHE_DIR, `${base}.${ext}`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      return `data:${mime};base64,${data.toString("base64")}`;
    }
  }
  return null;
}

/** Save base64 image data to cache file */
function saveToCache(group: string, name: string, mimeType: string, base64Data: string) {
  fs.mkdirSync(AVATAR_CACHE_DIR, { recursive: true });
  const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpeg";
  const filePath = path.join(AVATAR_CACHE_DIR, `${toFileName(group, name)}.${ext}`);
  fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
  console.log(`Cached avatar: ${filePath}`);
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Step 1: Identify group + members from the video
    const identifyResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { fileData: { fileUri: url, mimeType: "video/mp4" } },
            { text: IDENTIFY_PROMPT },
          ],
        },
      ],
    });

    let identifyText = identifyResponse.text?.trim() ?? "";
    const fenceMatch = identifyText.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (fenceMatch) identifyText = fenceMatch[1];

    let identifyData: { group: string; members: string[] };
    try {
      identifyData = JSON.parse(identifyText.trim());
    } catch {
      console.error("Failed to parse identify response:", identifyText.slice(0, 300));
      return NextResponse.json({ avatars: {} });
    }

    if (!identifyData.members?.length) {
      return NextResponse.json({ avatars: {} });
    }

    console.log(`Identified: ${identifyData.group} — ${identifyData.members.join(", ")}`);

    // Step 2: Check cache first, only generate missing avatars
    const avatarMap: Record<string, string> = {};
    const toGenerate: string[] = [];

    for (const name of identifyData.members) {
      const cached = getCached(identifyData.group, name);
      if (cached) {
        console.log(`Cache hit: ${name}`);
        avatarMap[name] = cached;
      } else {
        toGenerate.push(name);
      }
    }

    // Step 3: Generate only uncached avatars
    for (const name of toGenerate) {
      const prompt = `Generate a cute 2D pixel art character avatar of the K-pop idol "${name}" from "${identifyData.group}".
Style: 64x64 pixel art, chibi/cute proportions, colorful stage outfit, facing forward, transparent background.
Generate ONLY the image, no text.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        });

        const parts = response.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.data && part.inlineData?.mimeType) {
            // Save to cache
            saveToCache(identifyData.group, name, part.inlineData.mimeType, part.inlineData.data);
            avatarMap[name] = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (err) {
        console.error(`Avatar generation failed for ${name}:`, err);
      }
    }

    return NextResponse.json({ avatars: avatarMap });
  } catch (err) {
    console.error("Avatar generation error:", err);
    return NextResponse.json({ avatars: {} });
  }
}
