"use client";

import { MemberStatus } from "@/lib/types";

interface TrappedMemberProps {
  emoji: string;
  status: MemberStatus;
  isNearby: boolean;
}

export function TrappedMember({ emoji, status, isNearby }: TrappedMemberProps) {
  if (status === "rescued") return null;

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
