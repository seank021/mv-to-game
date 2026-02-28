"use client";

import { useGameStore } from "@/stores/gameStore";
import { ClearResult } from "./ClearResult";
import { GameOverResult } from "./GameOverResult";

export function ResultScreen() {
  const result = useGameStore((s) => s.result);

  if (!result) return null;

  return (
    <div className="min-h-[calc(100dvh-3rem)] flex items-center justify-center">
      {result.isCleared ? (
        <ClearResult result={result} />
      ) : (
        <GameOverResult result={result} />
      )}
    </div>
  );
}
