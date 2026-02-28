"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CUTSCENE_TEXTS, TYPING_SPEED_MS } from "@/lib/constants";

interface CutsceneTextProps {
  onComplete: () => void;
  analyzing?: boolean;
}

/** Fetch TTS audio from our API and play it */
async function speakGoogle(
  text: string,
  type: "narration" | "dialogue",
  audioRef: { current: HTMLAudioElement | null }
) {
  try {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, type }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "TTS failed" }));
      console.error("TTS error:", err.error);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = 0.85;
    audioRef.current = audio;

    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play();
  } catch (err) {
    console.error("TTS playback error:", err);
  }
}

export function CutsceneText({ onComplete, analyzing }: CutsceneTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [cutsceneFinished, setCutsceneFinished] = useState(false);
  const spokenRef = useRef(-1);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentLine = CUTSCENE_TEXTS[currentIndex];
  const isLastLine = currentIndex >= CUTSCENE_TEXTS.length - 1;

  // Typing animation + TTS per line
  useEffect(() => {
    if (!currentLine || cutsceneFinished) return;

    setDisplayedText("");
    setIsTyping(true);
    let charIndex = 0;

    // Speak via Google TTS (once per line)
    if (spokenRef.current !== currentIndex) {
      spokenRef.current = currentIndex;
      speakGoogle(currentLine.text, currentLine.type, ttsAudioRef);
    }

    const interval = setInterval(() => {
      charIndex++;
      setDisplayedText(currentLine.text.slice(0, charIndex));
      if (charIndex >= currentLine.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(interval);
  }, [currentIndex, currentLine, cutsceneFinished]);

  const advance = useCallback(() => {
    if (cutsceneFinished) return;

    if (isTyping) {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
      return;
    }
    if (!isLastLine) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Stop TTS audio
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
      setCutsceneFinished(true);
      onComplete();
    }
  }, [isTyping, currentIndex, currentLine, isLastLine, cutsceneFinished, onComplete]);

  // Auto-advance after 2s pause
  useEffect(() => {
    if (!isTyping && !cutsceneFinished) {
      const timer = setTimeout(advance, 2000);
      return () => clearTimeout(timer);
    }
  }, [isTyping, advance, cutsceneFinished]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
    };
  }, []);

  if (!currentLine) return null;

  const helperText = cutsceneFinished
    ? analyzing
      ? "Please wait for music video analysis..."
      : "Starting game..."
    : "Click to skip";

  return (
    <button
      onClick={advance}
      className="w-full max-w-lg text-left cursor-pointer focus:outline-none"
    >
      <div className="bg-surface/90 border border-surface-light rounded-xl p-6 backdrop-blur-sm">
        {currentLine.type === "narration" ? (
          <p className="text-gray-300 italic text-base md:text-lg leading-relaxed">
            {displayedText}
            {isTyping && <span className="typing-cursor" />}
          </p>
        ) : (
          <p className="text-white text-base md:text-lg leading-relaxed">
            <span className="text-primary font-bold">&quot;</span>
            {displayedText}
            {isTyping && <span className="typing-cursor" />}
            {!isTyping && <span className="text-primary font-bold">&quot;</span>}
          </p>
        )}
      </div>
      <p className={`text-center text-xs mt-3 font-pixel ${
        cutsceneFinished && analyzing ? "text-primary/70 animate-pulse" : "text-gray-600"
      }`}>
        {helperText}
      </p>
    </button>
  );
}
