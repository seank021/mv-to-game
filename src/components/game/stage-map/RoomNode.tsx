"use client";

import { motion } from "framer-motion";
import { MemberStatus } from "@/lib/types";

interface RoomNodeProps {
  roomEmoji: string;
  roomName: string;
  memberName: string;
  status: MemberStatus;
  onClick: () => void;
}

export function RoomNode({
  roomEmoji,
  roomName,
  memberName,
  status,
  onClick,
}: RoomNodeProps) {
  const isRescued = status === "rescued";

  return (
    <motion.button
      onClick={onClick}
      disabled={isRescued}
      whileHover={!isRescued ? { scale: 1.05 } : undefined}
      whileTap={!isRescued ? { scale: 0.95 } : undefined}
      className={`flex flex-col items-center gap-1 p-3 md:p-4 rounded-xl border-2 transition-all
        ${
          isRescued
            ? "border-success/40 bg-success/10 opacity-60 cursor-default"
            : "border-surface-light bg-surface hover:border-primary cursor-pointer"
        }`}
    >
      <span className="text-xl md:text-2xl">{roomEmoji}</span>
      <span className="font-pixel text-[6px] md:text-[8px] text-gray-300">
        {roomName}
      </span>
      <span className="font-pixel text-[6px] text-gray-500">
        ({memberName})
      </span>
      <span className="font-pixel text-[8px] mt-1">
        {isRescued ? (
          <span className="text-success">&#10003;</span>
        ) : (
          <span className="text-warning">&#128274;</span>
        )}
      </span>
    </motion.button>
  );
}
