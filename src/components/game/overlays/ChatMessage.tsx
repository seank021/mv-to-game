"use client";

import { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
  memberName?: string;
}

export function ChatMessage({ message, memberName }: ChatMessageProps) {
  const isPlayer = message.from === "player";
  const isSystem = message.from === "system";

  if (isSystem) {
    return (
      <div className="text-center my-2">
        <span className="text-gray-500 text-xs italic">{message.text}</span>
      </div>
    );
  }

  return (
    <div className={`flex ${isPlayer ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-xl px-3 py-2 ${
          isPlayer
            ? "bg-primary/20 border border-primary/30 text-white"
            : "bg-surface-light border border-surface-light text-gray-100"
        }`}
      >
        <span
          className={`text-[10px] font-bold block mb-1 ${
            isPlayer ? "text-primary" : "text-success"
          }`}
        >
          {isPlayer ? "You" : memberName ?? "Member"}
        </span>
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
    </div>
  );
}
