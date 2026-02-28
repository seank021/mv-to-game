"use client";

import { useRouter } from "next/navigation";
import { GameResult } from "@/lib/types";
import { useGameStore } from "@/stores/gameStore";
import { PixelButton } from "@/components/ui/PixelButton";
import { MemberAvatar } from "../MemberAvatar";
import { motion } from "framer-motion";

interface ClearResultProps {
  result: GameResult;
}

export function ClearResult({ result }: ClearResultProps) {
  const router = useRouter();
  const members = useGameStore((s) => s.members);
  const title = useGameStore((s) => s.title);
  const artist = useGameStore((s) => s.artist);
  const resetGame = useGameStore((s) => s.resetGame);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, "0")}s`;

  const totalUsed = result.totalTimeSeconds - result.remainingSeconds;

  return (
    <motion.div
      className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="font-pixel text-xl md:text-2xl text-success text-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        &#127881; CONCERT SAVED! &#127881;
      </motion.h1>

      <p className="text-gray-300 text-sm text-center">
        All members rescued!
      </p>

      {/* Result card */}
      <div className="bg-surface border border-surface-light rounded-xl p-5 w-full">
        <div className="text-center mb-4">
          <p className="font-pixel text-xs text-primary">{title}</p>
          <p className="text-gray-400 text-xs">{artist}</p>
        </div>

        <div className="border-t border-surface-light pt-4 mb-4">
          <p className="font-pixel text-[8px] text-gray-400 mb-2">
            Rescue Order:
          </p>
          {result.rescueOrder.map((memberId, i) => {
            const m = members.find((x) => x.id === memberId);
            return (
              <div key={memberId} className="flex items-center gap-2 mb-1">
                <span className="font-pixel text-[10px] text-warning">
                  {i === 0 ? "&#11088;" : `${i + 1}.`}
                </span>
                <span className="text-sm text-white flex items-center gap-1">
                  <MemberAvatar emoji={m?.emoji ?? ""} profileImage={m?.profileImage} name={m?.name ?? ""} size="sm" />
                  {m?.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>Clear Time: {formatTime(totalUsed)}</span>
          <span>Remaining: {result.remainingSeconds}s</span>
        </div>
      </div>

      {/* Share placeholder */}
      <div className="flex gap-2">
        <button className="bg-surface-light px-4 py-2 rounded-lg text-xs text-gray-300 hover:text-white transition-colors">
          Share on X
        </button>
        <button className="bg-surface-light px-4 py-2 rounded-lg text-xs text-gray-300 hover:text-white transition-colors">
          Instagram
        </button>
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
