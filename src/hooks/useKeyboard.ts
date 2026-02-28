"use client";

import { useEffect } from "react";

/**
 * Listen for single-press action keys (E, Escape).
 * Movement keys are handled by usePlayerMovement's held-key tracker.
 */
export function useActionKeys(
  enabled: boolean,
  onAction?: () => void,
  onEscape?: () => void
) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "e" && onAction) {
        e.preventDefault();
        onAction();
      }
      if (key === "escape" && onEscape) {
        e.preventDefault();
        onEscape();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onAction, onEscape]);
}
