"use client";

import { useState, useEffect, useCallback } from "react";
import { CutsceneText } from "./CutsceneText";
import { ProgressBar } from "./ProgressBar";
import { LOADING_MIN_DURATION_MS } from "@/lib/constants";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [cutsceneDone, setCutsceneDone] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  // Simulate loading progress
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / LOADING_MIN_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setTimerDone(true);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleCutsceneComplete = useCallback(() => {
    setCutsceneDone(true);
  }, []);

  // Transition when both cutscene and timer are done
  useEffect(() => {
    if (cutsceneDone && timerDone) {
      onComplete();
    }
  }, [cutsceneDone, timerDone, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-8 px-4">
      {/* Concert stage visual */}
      <div className="text-center mb-4">
        <div className="font-pixel text-xs text-gray-400 mb-2">
          Concert Stage
        </div>
        <div className="flex gap-4 justify-center text-2xl">
          <span className="silhouette">👩‍🎤</span>
          <span className="silhouette">👩‍🎤</span>
          <span className="silhouette">👩‍🎤</span>
          <span className="silhouette">👩‍🎤</span>
        </div>
      </div>

      {/* Cutscene */}
      <CutsceneText onComplete={handleCutsceneComplete} />

      {/* Progress */}
      <ProgressBar progress={progress} />
    </div>
  );
}
