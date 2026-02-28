"use client";

interface GameObjectProps {
  emoji: string;
  isNearby: boolean;
}

export function GameObject({ emoji, isNearby }: GameObjectProps) {
  return (
    <span
      className={`text-xl md:text-2xl select-none ${
        isNearby ? "object-nearby" : ""
      }`}
    >
      {emoji}
    </span>
  );
}
