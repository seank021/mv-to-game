"use client";

import { motion } from "framer-motion";
import { MemberStatus } from "@/lib/types";

interface SilhouetteProps {
  name: string;
  emoji: string;
  status: MemberStatus;
}

export function Silhouette({ name, emoji, status }: SilhouetteProps) {
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
        className={`text-base md:text-lg transition-all duration-800 ${
          isRescued ? "silhouette-revealed" : "silhouette"
        }`}
      >
        {emoji}
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
