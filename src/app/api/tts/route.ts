import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, type } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Use SSML for emotional expression
    const ssml =
      type === "dialogue"
        ? `<speak><prosody rate="fast" pitch="+2st"><emphasis level="strong">${escapeXml(text)}</emphasis></prosody></speak>`
        : `<speak><prosody rate="medium" pitch="+0st">${escapeXml(text)}</prosody></speak>`;

    // Try Google Cloud TTS API
    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { ssml },
          voice: {
            languageCode: "en-US",
            name: "en-US-Wavenet-F",
            ssmlGender: "FEMALE",
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: type === "dialogue" ? 1.5 : 1.35,
            pitch: type === "dialogue" ? 2.0 : 0.0,
            volumeGainDb: 0.0,
          },
        }),
      }
    );

    if (!ttsRes.ok) {
      const errBody = await ttsRes.text();
      console.error("Google TTS API error:", ttsRes.status, errBody);

      // Fallback: Google Translate TTS (unofficial but works)
      const encodedText = encodeURIComponent(text.slice(0, 200));
      const translateUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`;

      const fallbackRes = await fetch(translateUrl);
      if (!fallbackRes.ok) {
        return NextResponse.json(
          { error: `TTS failed: Cloud API (${ttsRes.status}), Translate fallback also failed` },
          { status: 500 }
        );
      }

      const audioBuffer = await fallbackRes.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Cloud TTS returns base64 audio
    const data = await ttsRes.json();
    const audioBytes = Buffer.from(data.audioContent, "base64");

    return new NextResponse(audioBytes, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("TTS API error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
