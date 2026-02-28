"use client";

import { useMemo } from "react";
import { Position, SmoothPosition } from "@/lib/types";
import { PROXIMITY_RADIUS, INTERACT_RADIUS } from "@/lib/constants";

function euclideanDistance(player: SmoothPosition, target: Position): number {
  return Math.sqrt(
    (player.x - target.col) ** 2 + (player.y - target.row) ** 2
  );
}

export interface ProximityTarget {
  id: string;
  position: Position;
}

export function useProximity(
  playerPos: SmoothPosition,
  targets: ProximityTarget[]
) {
  const nearby = useMemo(() => {
    return targets
      .map((t) => ({
        ...t,
        distance: euclideanDistance(playerPos, t.position),
      }))
      .filter((t) => t.distance <= PROXIMITY_RADIUS)
      .sort((a, b) => a.distance - b.distance);
  }, [playerPos, targets]);

  const interactable = useMemo(() => {
    return nearby.filter((t) => t.distance <= INTERACT_RADIUS);
  }, [nearby]);

  const nearestId = nearby.length > 0 ? nearby[0].id : null;
  const canInteract = interactable.length > 0;
  const interactTargetId = interactable.length > 0 ? interactable[0].id : null;

  return { nearby, nearestId, canInteract, interactTargetId };
}
