"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/gameStore";

/** Extract YouTube video ID from URL */
function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

/**
 * Plays BGM from the YouTube MV URL using a hidden iframe embed.
 * Falls back to /bgm.mp3 if no YouTube URL is available.
 */
export function useBGM() {
  const phase = useGameStore((s) => s.phase);
  const audioUrl = useGameStore((s) => s.audioUrl);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const usingYouTube = useRef(false);

  useEffect(() => {
    const shouldPlay = phase === "stage-map" || phase === "in-room";
    const videoId = audioUrl ? extractVideoId(audioUrl) : null;

    if (videoId && shouldPlay && !iframeRef.current) {
      // Create hidden YouTube iframe
      usingYouTube.current = true;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0`;
      iframe.allow = "autoplay";
      iframe.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px;left:-9999px;";
      document.body.appendChild(iframe);
      iframeRef.current = iframe;
    } else if (!videoId && shouldPlay) {
      // Fallback to local bgm.mp3
      usingYouTube.current = false;
      if (!audioRef.current) {
        const audio = new Audio("/bgm.mp3");
        audio.loop = true;
        audio.volume = 0.3;
        audioRef.current = audio;
      }
      audioRef.current.play().catch(() => {
        const resume = () => {
          audioRef.current?.play().catch(() => {});
          document.removeEventListener("click", resume);
        };
        document.addEventListener("click", resume);
      });
    }

    if (!shouldPlay) {
      // Stop YouTube
      if (iframeRef.current) {
        iframeRef.current.remove();
        iframeRef.current = null;
      }
      // Stop local audio
      if (audioRef.current) {
        if (phase === "result") {
          const audio = audioRef.current;
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
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 0.3;
        }
      }
    }
  }, [phase, audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.remove();
        iframeRef.current = null;
      }
    };
  }, []);
}
