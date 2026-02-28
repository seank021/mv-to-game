"use client";

import { useState, useEffect, useCallback } from "react";
import { CUTSCENE_TEXTS, TYPING_SPEED_MS } from "@/lib/constants";

interface CutsceneTextProps {
  onComplete: () => void;
}

export function CutsceneText({ onComplete }: CutsceneTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const currentLine = CUTSCENE_TEXTS[currentIndex];

  useEffect(() => {
    if (!currentLine) return;

    setDisplayedText("");
    setIsTyping(true);
    let charIndex = 0;

    const interval = setInterval(() => {
      charIndex++;
      setDisplayedText(currentLine.text.slice(0, charIndex));
      if (charIndex >= currentLine.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(interval);
  }, [currentIndex, currentLine]);

  const advance = useCallback(() => {
    if (isTyping) {
      // Skip typing animation
      setDisplayedText(currentLine.text);
      setIsTyping(false);
      return;
    }
    if (currentIndex < CUTSCENE_TEXTS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete();
    }
  }, [isTyping, currentIndex, currentLine, onComplete]);

  useEffect(() => {
    if (!isTyping) {
      const timer = setTimeout(advance, 2000);
      return () => clearTimeout(timer);
    }
  }, [isTyping, advance]);

  if (!currentLine) return null;

  return (
    <button
      onClick={advance}
      className="w-full max-w-lg text-left cursor-pointer focus:outline-none"
    >
      <div className="bg-surface/90 border border-surface-light rounded-xl p-6 backdrop-blur-sm">
        {currentLine.type === "narration" ? (
          <p className="text-gray-300 italic text-sm">
            {displayedText}
            {isTyping && <span className="typing-cursor" />}
          </p>
        ) : (
          <p className="text-white text-sm">
            <span className="text-primary font-bold">&quot;</span>
            {displayedText}
            {isTyping && <span className="typing-cursor" />}
            {!isTyping && <span className="text-primary font-bold">&quot;</span>}
          </p>
        )}
      </div>
      <p className="text-center text-gray-600 text-xs mt-3 font-pixel">
        {isTyping ? "Click to skip explanation..." : "Click to skip explanation..."}
      </p>
    </button>
  );
}
