"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/gameStore";

export function useTimer() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRunning = useGameStore((s) => s.timerRunning);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerRunning, tick]);
}
