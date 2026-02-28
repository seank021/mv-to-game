"use client";

import { useRouter } from "next/navigation";
import { GameResult } from "@/lib/types";
import { useGameStore } from "@/stores/gameStore";
import { PixelButton } from "@/components/ui/PixelButton";
import { motion } from "framer-motion";

interface GameOverResultProps {
  result: GameResult;
}

export function GameOverResult({ result }: GameOverResultProps) {
  const router = useRouter();
  const members = useGameStore((s) => s.members);
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <motion.div
      className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="font-pixel text-xl md:text-2xl text-danger text-center"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: 2 }}
      >
        &#128148; TIME OVER &#128148;
      </motion.h1>

      <p className="text-gray-300 text-sm text-center leading-relaxed">
        The song ended... The members
        <br />
        are still trapped in the MV!
      </p>

      {/* Rescued count */}
      <div className="bg-surface border border-surface-light rounded-xl p-5 w-full">
        <p className="font-pixel text-xs text-center text-gray-400 mb-4">
          Rescued: {result.rescuedCount}/{result.totalMembers}
        </p>

        <div className="flex justify-center gap-4">
          {members.map((m) => (
            <div key={m.id} className="flex flex-col items-center gap-1">
              <span className="text-2xl">
                {m.emoji}
              </span>
              <span
                className={`font-pixel text-[6px] ${
                  m.status === "rescued" ? "text-success" : "text-danger"
                }`}
              >
                {m.status === "rescued" ? "&#10003;" : "&#128274;"}
              </span>
              <span className="font-pixel text-[6px] text-gray-500">
                {m.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <PixelButton size="sm" onClick={resetGame}>
          Try Again
        </PixelButton>
        <PixelButton size="sm" variant="success" onClick={() => {
          resetGame();
          router.replace("/");
        }}>
          Another MV
        </PixelButton>
      </div>
    </motion.div>
  );
}
