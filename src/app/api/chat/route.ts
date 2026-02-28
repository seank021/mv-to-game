import { NextRequest, NextResponse } from "next/server";

const GEMINI_API = process.env.GEMINI_API;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API}`;

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function POST(req: NextRequest) {
  const { message, persona, history } = await req.json();

  if (!message || !persona) {
    return NextResponse.json({ error: "Missing message or persona" }, { status: 400 });
  }

  const systemPrompt = `${persona}

CRITICAL RULES:
- MAX 1-2 SHORT sentences. Never more. This is a fast game.
- Stay in character. Never mention being an AI.
- Be playful. Drop subtle puzzle hints sometimes.`;

  const contents: Message[] = [
    { role: "user", parts: [{ text: `System: ${systemPrompt}` }] },
    { role: "model", parts: [{ text: "Got it, I'm in character now." }] },
  ];

  if (history) {
    for (const msg of history) {
      contents.push({
        role: msg.from === "player" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }
  }

  contents.push({ role: "user", parts: [{ text: message }] });

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Gemini API error:", err);
    return NextResponse.json({ error: "Gemini API error" }, { status: 500 });
  }

  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "...";

  return NextResponse.json({ reply });
}
