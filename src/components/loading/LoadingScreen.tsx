"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CutsceneText } from "./CutsceneText";
import { ProgressBar } from "./ProgressBar";

interface LoadingScreenProps {
  onComplete: () => void;
  /** True while the MV analysis API call is still running */
  analyzing?: boolean;
}

export function LoadingScreen({ onComplete, analyzing }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [cutsceneDone, setCutsceneDone] = useState(false);
  const completedRef = useRef(false);

  // Progress bar: crawl while analyzing, jump to 100% when done
  const analysisDoneRef = useRef(false);

  useEffect(() => {
    if (!analyzing && analyzing !== undefined) {
      // Analysis finished — jump to 100% and stop
      analysisDoneRef.current = true;
      setProgress(100);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      if (analysisDoneRef.current) {
        clearInterval(interval);
        return;
      }
      const elapsed = Date.now() - start;
      if (analyzing) {
        // Crawl: 0→40% over 3s, then asymptotically approach 89%
        if (elapsed < 3000) {
          setProgress(Math.min(40, (elapsed / 3000) * 40));
        } else {
          const extraSec = (elapsed - 3000) / 1000;
          const crawl = 40 + 50 * (1 - 1 / (1 + extraSec * 0.05));
          setProgress(Math.min(89, crawl));
        }
      } else {
        // No analysis prop — fill over 5s
        const pct = Math.min(100, (elapsed / 5000) * 100);
        setProgress(pct);
        if (pct >= 100) clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [analyzing]);

  const handleCutsceneComplete = useCallback(() => {
    setCutsceneDone(true);
  }, []);

  // Transition when cutscene done AND progress is 100%
  useEffect(() => {
    if (cutsceneDone && progress >= 100 && !completedRef.current) {
      completedRef.current = true;
      setTimeout(() => onComplete(), 300);
    }
  }, [cutsceneDone, progress, onComplete]);

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
      <CutsceneText onComplete={handleCutsceneComplete} analyzing={analyzing} />

      {/* Progress */}
      <ProgressBar progress={progress} />

      {/* Analysis status */}
      {analyzing && (
        <p className="font-pixel text-[7px] text-primary/70 animate-pulse">
          Analyzing music video...
        </p>
      )}
    </div>
  );
}
