"use client";

import { Timer } from "./Timer";
import { useGameStore } from "@/stores/gameStore";

export function HeaderWidget() {
  const phase = useGameStore((s) => s.phase);
  const requestExitRoom = useGameStore((s) => s.requestExitRoom);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-sm border-b border-surface-light">
      <div className="flex items-center justify-between px-3 py-2 max-w-3xl mx-auto">
        <Timer />

        {phase === "in-room" && (
          <button
            onClick={requestExitRoom}
            className="font-pixel text-[8px] md:text-[10px] text-gray-300 hover:text-white
                       bg-surface px-3 py-1.5 rounded-lg border border-surface-light
                       hover:border-primary transition-colors"
          >
            Map
          </button>
        )}
      </div>
    </header>
  );
}
