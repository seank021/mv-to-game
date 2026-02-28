"use client";

interface InteractionHintProps {
  type: "object" | "member";
}

export function InteractionHint({ type }: InteractionHintProps) {
  return (
    <div className="hint-bounce fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-surface/90 border border-primary/50 rounded-lg px-4 py-2 backdrop-blur-sm">
        <span className="font-pixel text-[8px] md:text-[10px] text-primary">
          {type === "object"
            ? "Press E / Tap to examine"
            : "Press E / Tap to talk"}
        </span>
      </div>
    </div>
  );
}
