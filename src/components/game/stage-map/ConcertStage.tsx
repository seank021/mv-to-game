"use client";

import { useGameStore } from "@/stores/gameStore";
import { Silhouette } from "./Silhouette";
import { motion } from "framer-motion";

export function ConcertStage() {
  const members = useGameStore((s) => s.members);
  const allRescued = members.every((m) => m.status === "rescued");

  return (
    <motion.div
      className={`relative bg-surface/60 border-2 border-surface-light rounded-2xl p-4 md:p-6 mx-auto max-w-md
        ${allRescued ? "stage-clear-glow" : ""}`}
      animate={allRescued ? { borderColor: "#FFE66D" } : {}}
    >
      <div className="text-center mb-3">
        <span className="font-pixel text-[8px] md:text-[10px] text-gray-400">
          &#127908; Concert Stage
        </span>
      </div>

      <div className="flex justify-center gap-6 md:gap-8">
        {members.map((member) => (
          <Silhouette
            key={member.id}
            name={member.name}
            emoji={member.emoji}
            status={member.status}
          />
        ))}
      </div>

      {allRescued && (
        <motion.div
          className="text-center mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <span className="font-pixel text-[8px] text-warning">
            &#127775; Stage lights ON &#127775;
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
