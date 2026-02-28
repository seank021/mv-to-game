"use client";

import { useGameStore } from "@/stores/gameStore";
import {
  TIMER_WARNING_THRESHOLD,
  TIMER_CRITICAL_THRESHOLD,
} from "@/lib/constants";
import { TimerState } from "@/lib/types";

function getTimerState(seconds: number): TimerState {
  if (seconds <= 0) return "expired";
  if (seconds <= TIMER_CRITICAL_THRESHOLD) return "critical";
  if (seconds <= TIMER_WARNING_THRESHOLD) return "warning";
  return "normal";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Timer() {
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const durationSeconds = useGameStore((s) => s.durationSeconds);
  const state = getTimerState(timeRemaining);
  const progressPct = (timeRemaining / durationSeconds) * 100;

  const stateClasses: Record<TimerState, string> = {
    normal: "text-white",
    warning: "timer-warning",
    critical: "timer-critical",
    expired: "text-danger",
  };

  const barColors: Record<TimerState, string> = {
    normal: "bg-success",
    warning: "bg-warning",
    critical: "bg-danger",
    expired: "bg-danger",
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">&#9835;</span>
      <span className={`font-pixel text-[10px] md:text-xs ${stateClasses[state]}`}>
        {formatTime(timeRemaining)}
      </span>
      <div className="w-16 md:w-24 h-2 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full ${barColors[state]} transition-all duration-1000 rounded-full`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
