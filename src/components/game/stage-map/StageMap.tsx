"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useGameStore } from "@/stores/gameStore";
import { usePlayerMovement } from "@/hooks/usePlayerMovement";
import { useProximity, ProximityTarget } from "@/hooks/useProximity";
import { useActionKeys } from "@/hooks/useKeyboard";
import { Silhouette } from "./Silhouette";
import { VirtualJoystick } from "@/components/ui/VirtualJoystick";
import {
  STAGE_COLS,
  STAGE_ROWS,
  CELL_SIZE,
  CELL_SIZE_MOBILE,
  STAGE_PORTALS,
  STAGE_MAP_LAYOUT,
  STAGE_AREA,
  PLAYER_RADIUS,
} from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

/** Check if player (with radius) can occupy position (x, y) on the tile map. */
function canOccupyMap(x: number, y: number): boolean {
  const r = PLAYER_RADIUS;
  const corners = [
    [x - r, y - r],
    [x + r, y - r],
    [x - r, y + r],
    [x + r, y + r],
  ];
  return corners.every(([cx, cy]) => {
    const col = Math.floor(cx);
    const row = Math.floor(cy);
    if (row < 0 || row >= STAGE_ROWS || col < 0 || col >= STAGE_COLS) return false;
    return STAGE_MAP_LAYOUT[row][col] === 1;
  });
}

/** Check if a walkable cell borders a wall on a given side. */
function hasWallBorder(row: number, col: number, side: "top" | "bottom" | "left" | "right"): boolean {
  const dr = side === "top" ? -1 : side === "bottom" ? 1 : 0;
  const dc = side === "left" ? -1 : side === "right" ? 1 : 0;
  const nr = row + dr;
  const nc = col + dc;
  if (nr < 0 || nr >= STAGE_ROWS || nc < 0 || nc >= STAGE_COLS) return true;
  return STAGE_MAP_LAYOUT[nr][nc] === 0;
}

export function StageMap() {
  const members = useGameStore((s) => s.members);
  const requestEnterRoom = useGameStore((s) => s.requestEnterRoom);
  const triggerAllClear = useGameStore((s) => s.triggerAllClear);
  const transitionStep = useGameStore((s) => s.transitionStep);

  const [celebrating, setCelebrating] = useState(false);
  const celebrateTriggered = useRef(false);

  const allRescued = members.every((m) => m.status === "rescued");

  // Detect all-clear and trigger celebration
  useEffect(() => {
    if (allRescued && !celebrateTriggered.current) {
      celebrateTriggered.current = true;
      setCelebrating(true);

      // After celebration animation, go to result
      const timer = setTimeout(() => {
        triggerAllClear();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [allRescued, triggerAllClear]);

  const enabled = transitionStep === "none" && !celebrating;

  const canOccupy = useCallback(canOccupyMap, []);

  const { playerPosition, addDirection, removeDirection } =
    usePlayerMovement(STAGE_COLS, STAGE_ROWS, enabled, canOccupy);

  // Portal proximity targets
  const portalTargets: ProximityTarget[] = useMemo(
    () =>
      STAGE_PORTALS.map((p) => ({
        id: `portal-${p.roomId}`,
        position: { row: p.row, col: p.col },
      })),
    []
  );

  const { canInteract, interactTargetId } = useProximity(
    playerPosition,
    portalTargets
  );

  const handleInteract = useCallback(() => {
    if (!interactTargetId) return;
    const roomId = interactTargetId.replace("portal-", "");
    const member = members.find((m) => m.roomId === roomId);
    if (member && member.status !== "rescued") {
      requestEnterRoom(roomId);
    }
  }, [interactTargetId, members, requestEnterRoom]);

  useActionKeys(enabled, handleInteract);

  const getMemberForRoom = (roomId: string) =>
    members.find((m) => m.roomId === roomId);

  // Check if a cell is part of the stage area
  const isStageCell = (r: number, c: number) =>
    r >= STAGE_AREA.startRow &&
    r <= STAGE_AREA.endRow &&
    c >= STAGE_AREA.startCol &&
    c <= STAGE_AREA.endCol;

  return (
    <motion.div
      className="flex flex-col items-center gap-3 p-4 min-h-[calc(100dvh-3rem)] justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Map */}
      <div
        className="relative"
        style={{
          width: STAGE_COLS * CELL_SIZE,
          height: STAGE_ROWS * CELL_SIZE,
        }}
      >
        {/* CSS for mobile cell size */}
        <style jsx>{`
          @media (max-width: 768px) {
            div { --cell: ${CELL_SIZE_MOBILE}px; }
          }
        `}</style>

        {/* Render tile map */}
        {STAGE_MAP_LAYOUT.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            if (cell === 0) return null;

            const isStage = isStageCell(rowIdx, colIdx);
            const portal = STAGE_PORTALS.find(
              (p) => p.row === rowIdx && p.col === colIdx
            );

            // Wall-border classes for corridor feel
            const borders = [
              hasWallBorder(rowIdx, colIdx, "top") ? "border-t-2 border-t-surface-light" : "",
              hasWallBorder(rowIdx, colIdx, "bottom") ? "border-b-2 border-b-surface-light" : "",
              hasWallBorder(rowIdx, colIdx, "left") ? "border-l-2 border-l-surface-light" : "",
              hasWallBorder(rowIdx, colIdx, "right") ? "border-r-2 border-r-surface-light" : "",
            ].join(" ");

            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`absolute ${borders} ${
                  isStage
                    ? "bg-warning/8"
                    : portal
                    ? "bg-primary/15"
                    : "bg-surface/20"
                }`}
                style={{
                  left: colIdx * CELL_SIZE,
                  top: rowIdx * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              />
            );
          })
        )}

        {/* Room portals */}
        {STAGE_PORTALS.map((portal) => {
          const member = getMemberForRoom(portal.roomId);
          const isRescued = member?.status === "rescued";
          const isNear =
            canInteract && interactTargetId === `portal-${portal.roomId}`;

          return (
            <div
              key={portal.roomId}
              className="absolute flex flex-col items-center justify-center pointer-events-none"
              style={{
                left: portal.col * CELL_SIZE,
                top: portal.row * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            >
              <div
                className={`flex flex-col items-center justify-center w-full h-full rounded-md transition-all
                  ${
                    isRescued
                      ? "opacity-40"
                      : isNear
                      ? "bg-primary/30 shadow-lg shadow-primary/40 ring-2 ring-primary/60"
                      : "bg-surface/50"
                  }`}
              >
                <span className="text-sm md:text-base leading-none">
                  {portal.emoji}
                </span>
                <span className="font-pixel text-[5px] text-gray-400 mt-0.5">
                  {portal.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Stage area — concert stage with silhouettes */}
        <div
          className="absolute flex flex-col items-center justify-center pointer-events-none"
          style={{
            left: STAGE_AREA.startCol * CELL_SIZE,
            top: STAGE_AREA.startRow * CELL_SIZE,
            width: (STAGE_AREA.endCol - STAGE_AREA.startCol + 1) * CELL_SIZE,
            height: (STAGE_AREA.endRow - STAGE_AREA.startRow + 1) * CELL_SIZE,
          }}
        >
          <div
            className={`flex flex-col items-center gap-1 ${
              members.every((m) => m.status === "rescued") ? "stage-clear-glow rounded-lg" : ""
            }`}
          >
            <span className="font-pixel text-[5px] md:text-[6px] text-gray-500">
              STAGE
            </span>
            <div className="flex gap-1">
              {members.map((m) => (
                <Silhouette
                  key={m.id}
                  name={m.name}
                  emoji={m.emoji}
                  status={m.status}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Entry arrow */}
        <div
          className="absolute flex items-center justify-center pointer-events-none text-primary/60"
          style={{
            left: 0,
            top: 5 * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        >
          <span className="font-pixel text-[10px]">&rarr;</span>
        </div>

        {/* Player */}
        <div
          className="absolute z-10 flex items-center justify-center pointer-events-none"
          style={{
            left: `calc(${playerPosition.x} * ${CELL_SIZE}px)`,
            top: `calc(${playerPosition.y} * ${CELL_SIZE}px)`,
            width: CELL_SIZE,
            height: CELL_SIZE,
            transform: "translate(-50%, -50%)",
            marginLeft: CELL_SIZE / 2,
            marginTop: CELL_SIZE / 2,
          }}
        >
          <span className="text-lg md:text-xl drop-shadow-lg">&#129489;</span>
        </div>

        {/* Interaction hint */}
        {canInteract && enabled && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="hint-bounce bg-surface/90 border border-primary/50 rounded-lg px-3 py-1 backdrop-blur-sm">
              <span className="font-pixel text-[7px] md:text-[8px] text-primary">
                Press E to enter
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="font-pixel text-[7px] text-gray-600 text-center mt-2">
        WASD / Arrows to move &middot; E to enter room
      </p>

      {/* Mobile controls */}
      <VirtualJoystick
        onDirectionStart={addDirection}
        onDirectionEnd={removeDirection}
        onAction={handleInteract}
      />

      {/* All-clear celebration overlay */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <motion.div
                className="text-5xl md:text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
                transition={{ duration: 1, delay: 0.8, repeat: 1 }}
              >
                &#127775;
              </motion.div>
              <motion.h2
                className="font-pixel text-lg md:text-xl text-warning mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                ALL MEMBERS RESCUED!
              </motion.h2>
              <motion.div
                className="flex gap-3 justify-center text-2xl md:text-3xl mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                {members.map((m) => (
                  <motion.span
                    key={m.id}
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 0.5,
                      delay: 1.8 + members.indexOf(m) * 0.15,
                      repeat: 2,
                    }}
                  >
                    {m.emoji}
                  </motion.span>
                ))}
              </motion.div>
              <motion.p
                className="font-pixel text-[8px] md:text-[10px] text-warning/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                CONCERT SAVED!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
