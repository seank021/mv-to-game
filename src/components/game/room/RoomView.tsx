"use client";

import { useCallback, useMemo } from "react";
import { useGameStore } from "@/stores/gameStore";
import { usePlayerMovement } from "@/hooks/usePlayerMovement";
import { useProximity, ProximityTarget } from "@/hooks/useProximity";
import { useActionKeys } from "@/hooks/useKeyboard";
import { ROOM_COLS, ROOM_ROWS, CELL_SIZE, CELL_SIZE_MOBILE, ROOM_EXIT_POSITION } from "@/lib/constants";
import { ChatPanel } from "../overlays/ChatPanel";
import { QuizPanel } from "../overlays/QuizPanel";
import { ObjectPopup } from "../overlays/ObjectPopup";
import { RescueAnimation } from "../overlays/RescueAnimation";
import { VirtualJoystick } from "@/components/ui/VirtualJoystick";
import { MemberAvatar } from "../MemberAvatar";
import { motion } from "framer-motion";

export function RoomView() {
  const currentRoomId = useGameStore((s) => s.currentRoomId);
  const members = useGameStore((s) => s.members);
  const activeOverlay = useGameStore((s) => s.activeOverlay);
  const openOverlay = useGameStore((s) => s.openOverlay);
  const closeOverlay = useGameStore((s) => s.closeOverlay);
  const overlayData = useGameStore((s) => s.overlayData);
  const transitionStep = useGameStore((s) => s.transitionStep);
  const requestExitRoom = useGameStore((s) => s.requestExitRoom);

  const member = members.find((m) => m.roomId === currentRoomId);

  const movementEnabled = !activeOverlay && transitionStep === "none" && !!member;

  const { playerPosition, addDirection, removeDirection } =
    usePlayerMovement(ROOM_COLS, ROOM_ROWS, movementEnabled);

  // Build proximity targets
  const targets: ProximityTarget[] = useMemo(() => {
    if (!member) return [];
    const t: ProximityTarget[] = [];

    member.objects.forEach((obj) => {
      t.push({ id: `obj-${obj.id}`, position: obj.position });
    });

    if (member.status === "trapped") {
      t.push({ id: `member-${member.id}`, position: member.position });
    }

    // Exit point
    t.push({ id: "exit", position: ROOM_EXIT_POSITION });

    return t;
  }, [member]);

  const { nearby, canInteract, interactTargetId } = useProximity(playerPosition, targets);

  const handleInteract = useCallback(() => {
    if (!interactTargetId || activeOverlay) return;

    if (interactTargetId === "exit") {
      requestExitRoom();
      return;
    }

    if (interactTargetId.startsWith("obj-")) {
      const objId = interactTargetId.replace("obj-", "");
      openOverlay("object", { objectId: objId });
      return;
    }

    if (interactTargetId.startsWith("member-") && member) {
      const memberId = interactTargetId.replace("member-", "");
      openOverlay("chat", { memberId });
      const m = useGameStore.getState().getMember(memberId);
      if (m && useGameStore.getState().chatMessages.length === 0) {
        useGameStore.getState().addChatMessage({
          id: "greeting",
          from: "member",
          text: m.chat.greeting,
        });
      }
    }
  }, [interactTargetId, activeOverlay, openOverlay, member, requestExitRoom]);

  const handleEscape = useCallback(() => {
    if (activeOverlay) {
      closeOverlay();
    }
  }, [activeOverlay, closeOverlay]);

  useActionKeys(movementEnabled || !!activeOverlay, handleInteract, handleEscape);

  if (!member) return null;

  // Determine hint
  const hintText = interactTargetId
    ? interactTargetId === "exit"
      ? "Press E to exit"
      : interactTargetId.startsWith("member-")
      ? "Press E to talk"
      : "Press E to examine"
    : null;

  return (
    <motion.div
      className={`relative flex flex-col items-center justify-center min-h-[calc(100dvh-3rem)] p-2 md:p-4 ${member.roomBackground} overflow-hidden`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Full-page blurred background image */}
      {member.roomBackgroundImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${member.roomBackgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(12px)",
            transform: "scale(1.1)",
          }}
        />
      )}
      {/* Dark overlay for readability */}
      {member.roomBackgroundImage && (
        <div className="absolute inset-0 bg-black/50 z-0" />
      )}

      {/* Room title */}
      <div className="relative z-10 text-center mb-2">
        <span className="font-pixel text-[8px] md:text-[10px] text-gray-300">
          {member.roomEmoji} {member.roomName}
        </span>
      </div>

      {/* Game Area — absolute positioned entities on grid */}
      <div
        className="relative z-10 rounded-xl border border-white/10 overflow-hidden"
        style={{
          width: ROOM_COLS * CELL_SIZE,
          height: ROOM_ROWS * CELL_SIZE,
          backgroundImage: member.roomBackgroundImage
            ? `url(${member.roomBackgroundImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: member.roomBackgroundImage ? undefined : "rgba(0,0,0,0.3)",
        }}
      >
        {/* Dark overlay on game area for readability */}
        {member.roomBackgroundImage && (
          <div className="absolute inset-0 bg-black/30 z-0" />
        )}

        {/* Responsive mobile override */}
        <style jsx>{`
          @media (max-width: 768px) {
            div {
              width: ${ROOM_COLS * CELL_SIZE_MOBILE}px !important;
              height: ${ROOM_ROWS * CELL_SIZE_MOBILE}px !important;
            }
          }
        `}</style>

        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: `var(--cell-size) var(--cell-size)`,
          }}
        />

        {/* Exit door */}
        <div
          className="absolute flex items-center justify-center bg-primary/15 border border-primary/30 rounded"
          style={{
            left: `calc(${ROOM_EXIT_POSITION.col} * var(--cell-size))`,
            top: `calc(${ROOM_EXIT_POSITION.row} * var(--cell-size))`,
            width: `var(--cell-size)`,
            height: `var(--cell-size)`,
          }}
        >
          <span className="text-sm opacity-60">&#128682;</span>
        </div>

        {/* Objects */}
        {member.objects.map((obj) => {
          const isNearby = nearby.some((n) => n.id === `obj-${obj.id}`);
          return (
            <div
              key={obj.id}
              className={`absolute flex items-center justify-center ${
                isNearby ? "object-nearby" : ""
              }`}
              style={{
                left: `calc(${obj.position.col} * var(--cell-size))`,
                top: `calc(${obj.position.row} * var(--cell-size))`,
                width: `var(--cell-size)`,
                height: `var(--cell-size)`,
              }}
            >
              <span className="text-base md:text-lg">{obj.emoji}</span>
            </div>
          );
        })}

        {/* Trapped member */}
        {member.status === "trapped" && (
          <div
            className={`absolute flex items-center justify-center ${
              nearby.some((n) => n.id === `member-${member.id}`)
                ? "object-nearby"
                : ""
            }`}
            style={{
              left: `calc(${member.position.col} * var(--cell-size))`,
              top: `calc(${member.position.row} * var(--cell-size))`,
              width: `var(--cell-size)`,
              height: `var(--cell-size)`,
            }}
          >
            <MemberAvatar emoji={member.emoji} profileImage={member.profileImage} name={member.name} size="md" />
          </div>
        )}

        {/* Player — smooth positioned */}
        <div
          className="absolute z-10 flex items-center justify-center pointer-events-none"
          style={{
            left: `calc(${playerPosition.x} * var(--cell-size))`,
            top: `calc(${playerPosition.y} * var(--cell-size))`,
            width: `var(--cell-size)`,
            height: `var(--cell-size)`,
          }}
        >
          <span className="text-lg md:text-xl drop-shadow-lg">&#129489;</span>
        </div>

        {/* Interaction hint — positioned near the target */}
        {hintText && canInteract && !activeOverlay && (() => {
          const target = targets.find((t) => t.id === interactTargetId);
          if (!target) return null;
          const showBelow = target.position.row <= 1;
          return (
            <div
              className="absolute z-20 pointer-events-none flex justify-center"
              style={{
                left: `calc(${target.position.col} * var(--cell-size) - var(--cell-size) / 2)`,
                top: `calc(${(showBelow ? target.position.row + 1 : target.position.row - 1)} * var(--cell-size))`,
                width: `calc(var(--cell-size) * 2)`,
              }}
            >
              <div className="hint-bounce bg-surface/90 border border-primary/50 rounded-lg px-2 py-0.5 backdrop-blur-sm whitespace-nowrap">
                <span className="font-pixel text-[5px] md:text-[6px] text-primary">
                  {hintText}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Overlays */}
      {activeOverlay === "chat" && <ChatPanel memberId={overlayData?.memberId} />}
      {activeOverlay === "quiz" && <QuizPanel memberId={overlayData?.memberId} />}
      {activeOverlay === "object" && (
        <ObjectPopup objectId={overlayData?.objectId} objects={member.objects} />
      )}
      {activeOverlay === "rescue" && <RescueAnimation memberName={member.name} />}

      {/* Mobile controls */}
      {!activeOverlay && (
        <VirtualJoystick
          onDirectionStart={addDirection}
          onDirectionEnd={removeDirection}
          onAction={handleInteract}
        />
      )}
    </motion.div>
  );
}
