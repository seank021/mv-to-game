import { FrameInfo } from "./api";

/**
 * Find the closest extracted frame to a given timestamp.
 * Returns the frame URL (prepended with API base if relative).
 */
export function findClosestFrame(
  timestamp: number | string,
  frames: FrameInfo[],
  apiBase: string = ""
): string | undefined {
  if (!frames.length) return undefined;
  const ts = typeof timestamp === "string" ? parseFloat(timestamp) : timestamp;
  if (isNaN(ts)) return undefined;

  let closest = frames[0];
  let minDiff = Math.abs(frames[0].timestamp - ts);

  for (const frame of frames) {
    const diff = Math.abs(frame.timestamp - ts);
    if (diff < minDiff) {
      minDiff = diff;
      closest = frame;
    }
  }

  // Prepend API base for relative URLs
  const url = closest.url;
  return url.startsWith("http") ? url : `${apiBase}${url}`;
}

/**
 * Given zones with backgroundTimestamp and extracted frames,
 * resolve each zone's backgroundImageUrl.
 */
export function resolveZoneBackgrounds(
  zones: { zoneId: string; backgroundTimestamp: string }[],
  frames: FrameInfo[],
  apiBase: string = ""
): Map<string, string> {
  const map = new Map<string, string>();
  for (const zone of zones) {
    const url = findClosestFrame(zone.backgroundTimestamp, frames, apiBase);
    if (url) map.set(zone.zoneId, url);
  }
  return map;
}
