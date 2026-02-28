"use client";

import { motion } from "framer-motion";
import { MemberStatus } from "@/lib/types";
import { MemberAvatar } from "../MemberAvatar";

interface SilhouetteProps {
  name: string;
  emoji: string;
  profileImage?: string;
  status: MemberStatus;
  compact?: boolean;
}

export function Silhouette({ name, emoji, profileImage, status, compact }: SilhouetteProps) {
  const isRescued = status === "rescued";

  return (
    <motion.div
      className="flex flex-col items-center"
      animate={
        isRescued
          ? { scale: [1, 1.2, 1], filter: "brightness(1)" }
          : { scale: 1 }
      }
      transition={{ duration: 0.8 }}
    >
      <span
        className={`transition-all duration-800 ${
          isRescued ? "silhouette-revealed" : "silhouette"
        }`}
      >
        <MemberAvatar emoji={emoji} profileImage={profileImage} name={name} size={compact ? "sm" : "md"} />
      </span>
      {isRescued && (
        <motion.span
          className="text-[4px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          &#10024;
        </motion.span>
      )}
    </motion.div>
  );
}
