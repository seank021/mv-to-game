"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "@/stores/gameStore";
import { MOVE_SPEED } from "@/lib/constants";

/**
 * Smooth player movement with rAF loop, held-key tracking, and optional wall collision.
 *
 * @param gridCols   Grid width in cells
 * @param gridRows   Grid height in cells
 * @param enabled    Whether movement is active
 * @param canOccupy  Optional collision check — returns true if player center can be at (x, y).
 *                   When omitted, only grid bounds are checked.
 */
export function usePlayerMovement(
  gridCols: number,
  gridRows: number,
  enabled: boolean,
  canOccupy?: (x: number, y: number) => boolean
) {
  const heldDirs = useRef(new Set<string>());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const canOccupyRef = useRef(canOccupy);
  canOccupyRef.current = canOccupy;

  // Keyboard listeners — track held state
  useEffect(() => {
    if (!enabled) return;

    const onDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        [
          "w", "a", "s", "d",
          "arrowup", "arrowdown", "arrowleft", "arrowright",
        ].includes(key)
      ) {
        e.preventDefault();
        heldDirs.current.add(key);
      }
    };

    const onUp = (e: KeyboardEvent) => {
      heldDirs.current.delete(e.key.toLowerCase());
    };

    const onBlur = () => heldDirs.current.clear();

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      heldDirs.current.clear();
    };
  }, [enabled]);

  // rAF movement loop
  useEffect(() => {
    if (!enabled) return;

    const defaultCheck = (x: number, y: number) =>
      x >= 0 && x <= gridCols - 1 && y >= 0 && y <= gridRows - 1;

    lastTimeRef.current = 0;

    const loop = (time: number) => {
      // Compute delta in seconds; cap at 50ms to avoid huge jumps on tab-switch
      const dt =
        lastTimeRef.current === 0
          ? 1 / 60
          : Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      const dirs = heldDirs.current;
      let dx = 0;
      let dy = 0;

      if (dirs.has("w") || dirs.has("arrowup")) dy -= 1;
      if (dirs.has("s") || dirs.has("arrowdown")) dy += 1;
      if (dirs.has("a") || dirs.has("arrowleft")) dx -= 1;
      if (dirs.has("d") || dirs.has("arrowright")) dx += 1;

      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
          dx *= 0.707;
          dy *= 0.707;
        }

        // Apply speed * delta time
        dx *= MOVE_SPEED * dt;
        dy *= MOVE_SPEED * dt;

        const state = useGameStore.getState();
        const cx = state.playerPosition.x;
        const cy = state.playerPosition.y;
        const check = canOccupyRef.current ?? defaultCheck;

        // Try full move
        if (check(cx + dx, cy + dy)) {
          state.setPlayerPosition(cx + dx, cy + dy);
        }
        // Wall slide: try x only
        else if (dx !== 0 && check(cx + dx, cy)) {
          state.setPlayerPosition(cx + dx, cy);
        }
        // Wall slide: try y only
        else if (dy !== 0 && check(cx, cy + dy)) {
          state.setPlayerPosition(cx, cy + dy);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, gridCols, gridRows]);

  // Joystick support
  const addDirection = useCallback((dir: string) => {
    heldDirs.current.add(dir);
  }, []);

  const removeDirection = useCallback((dir: string) => {
    heldDirs.current.delete(dir);
  }, []);

  const playerPosition = useGameStore((s) => s.playerPosition);

  return { playerPosition, addDirection, removeDirection };
}
