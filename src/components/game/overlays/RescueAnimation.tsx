"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { motion } from "framer-motion";

interface RescueAnimationProps {
  memberName: string;
}

export function RescueAnimation({ memberName }: RescueAnimationProps) {
  const requestExitRoom = useGameStore((s) => s.requestExitRoom);

  useEffect(() => {
    const timer = setTimeout(() => {
      requestExitRoom();
    }, 2500);
    return () => clearTimeout(timer);
  }, [requestExitRoom]);

  return (
    <div className="overlay-backdrop fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 1.5, times: [0, 0.5, 1] }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: 2 }}
        >
          &#127775;
        </motion.div>
        <h2 className="font-pixel text-lg md:text-xl text-success mb-2">
          RESCUED!
        </h2>
        <p className="font-pixel text-xs text-white">
          {memberName} is free!
        </p>
        <motion.p
          className="font-pixel text-[8px] text-gray-400 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Returning to stage...
        </motion.p>
      </motion.div>
    </div>
  );
}
