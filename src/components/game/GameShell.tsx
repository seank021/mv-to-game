"use client";

import { useGameStore } from "@/stores/gameStore";
import { useTimer } from "@/hooks/useTimer";
import { useBGM } from "@/hooks/useBGM";
import { HeaderWidget } from "./HeaderWidget";
import { StageMap } from "./stage-map/StageMap";
import { RoomView } from "./room/RoomView";
import { ResultScreen } from "./result/ResultScreen";
import { motion, AnimatePresence } from "framer-motion";
import { TRANSITION_DURATION_MS } from "@/lib/constants";

export function GameShell() {
  const phase = useGameStore((s) => s.phase);
  const transitionStep = useGameStore((s) => s.transitionStep);
  const pendingRoomId = useGameStore((s) => s.pendingRoomId);
  const commitTransition = useGameStore((s) => s.commitTransition);
  const finishTransition = useGameStore((s) => s.finishTransition);
  const members = useGameStore((s) => s.members);

  useTimer();
  useBGM();

  // Get the portal info for transition label
  const pendingMember = pendingRoomId
    ? members.find((m) => m.roomId === pendingRoomId)
    : null;

  return (
    <div className="min-h-dvh">
      {(phase === "stage-map" || phase === "in-room") && <HeaderWidget />}

      <main className="pt-12">
        {phase === "stage-map" && <StageMap />}
        {phase === "in-room" && <RoomView />}
        {phase === "result" && <ResultScreen />}
      </main>

      {/* Room transition overlay */}
      <AnimatePresence>
        {transitionStep !== "none" && (
          <motion.div
            key={transitionStep}
            className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
            initial={{ opacity: transitionStep === "fading-out" ? 0 : 1 }}
            animate={{ opacity: transitionStep === "fading-out" ? 1 : 0 }}
            transition={{ duration: TRANSITION_DURATION_MS / 1000, ease: "easeInOut" }}
            onAnimationComplete={() => {
              if (transitionStep === "fading-out") {
                commitTransition();
              } else if (transitionStep === "fading-in") {
                finishTransition();
              }
            }}
          >
            {/* Show room name during transition */}
            {transitionStep === "fading-out" && pendingMember && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <span className="text-4xl mb-3 block">{pendingMember.roomEmoji}</span>
                <span className="font-pixel text-sm text-primary">
                  {pendingMember.roomName}
                </span>
              </motion.div>
            )}
            {transitionStep === "fading-out" && !pendingMember && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <span className="font-pixel text-xs text-gray-400">
                  Returning to stage...
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
