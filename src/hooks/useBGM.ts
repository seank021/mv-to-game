"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/gameStore";

/**
 * Plays background music during gameplay (stage-map and in-room phases).
 * Place your audio file at public/bgm.mp3.
 */
export function useBGM() {
  const phase = useGameStore((s) => s.phase);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element once
    if (!audioRef.current) {
      const audio = new Audio("/bgm.mp3");
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    const shouldPlay = phase === "stage-map" || phase === "in-room";

    if (shouldPlay) {
      // Browsers require user gesture before playing audio.
      // The game already had a click (start button), so this should work.
      audio.play().catch(() => {
        // Autoplay blocked — attach a one-time click listener
        const resume = () => {
          audio.play().catch(() => {});
          document.removeEventListener("click", resume);
        };
        document.addEventListener("click", resume);
      });
    } else if (phase === "result") {
      // Fade out on result screen
      const fade = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
          audio.pause();
          audio.volume = 0.3;
          audio.currentTime = 0;
          clearInterval(fade);
        }
      }, 100);
      return () => clearInterval(fade);
    } else {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0.3;
    }
  }, [phase]);
}
