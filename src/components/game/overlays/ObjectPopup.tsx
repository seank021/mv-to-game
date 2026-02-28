"use client";

import { useGameStore } from "@/stores/gameStore";
import { ObjectData } from "@/lib/types";
import { PixelButton } from "@/components/ui/PixelButton";
import { motion } from "framer-motion";

interface ObjectPopupProps {
  objectId?: string;
  objects: ObjectData[];
}

export function ObjectPopup({ objectId, objects }: ObjectPopupProps) {
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const obj = objects.find((o) => o.id === objectId);

  if (!obj) return null;

  return (
    <div className="overlay-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-surface border border-surface-light rounded-xl p-6 max-w-sm w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        <div className="text-center mb-4">
          <span className="text-4xl">{obj.emoji}</span>
        </div>
        <h3 className="font-pixel text-xs text-white text-center mb-3">
          {obj.label}
        </h3>
        <p className="text-gray-300 text-sm text-center mb-6 leading-relaxed">
          {obj.description}
        </p>
        {obj.isKeyObject && (
          <p className="text-warning text-xs text-center mb-4 font-pixel">
            &#10024; This seems important...
          </p>
        )}
        <div className="flex justify-center">
          <PixelButton size="sm" onClick={closeOverlay}>
            Close
          </PixelButton>
        </div>
      </motion.div>
    </div>
  );
}
