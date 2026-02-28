"use client";

import { useEffect } from "react";

/**
 * Listen for single-press action keys (E, Escape).
 * Movement keys are handled by usePlayerMovement's held-key tracker.
 */
/** Check if the event target is a text input (don't steal keys from inputs) */
function isTypingInInput(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable === true;
}

export function useActionKeys(
  enabled: boolean,
  onAction?: () => void,
  onEscape?: () => void
) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Escape always works, but other keys should not interfere with text inputs
      if (e.key === "Escape" && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (isTypingInInput(e)) return;

      const key = e.key.toLowerCase();
      if (key === "e" && onAction) {
        e.preventDefault();
        onAction();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onAction, onEscape]);
}
