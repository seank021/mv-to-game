"use client";

import { useState, useCallback } from "react";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { GameShell } from "@/components/game/GameShell";
import { useGameStore } from "@/stores/gameStore";

export default function PlayPage() {
  const [showLoading, setShowLoading] = useState(true);
  const initGame = useGameStore((s) => s.initGame);

  const handleLoadingComplete = useCallback(() => {
    initGame();
    setShowLoading(false);
  }, [initGame]);

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return <GameShell />;
}
