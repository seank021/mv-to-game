"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { GameShell } from "@/components/game/GameShell";
import { useGameStore } from "@/stores/gameStore";
import { transformAnalyzerOutput, AnalyzerOutput } from "@/lib/transform";
import { GameData } from "@/lib/types";

const FRAME_EXTRACTOR_URL = "http://localhost:8080";
const FRAME_EXTRACTION_TIMEOUT_MS = 30_000;
const FRAME_POLL_INTERVAL_MS = 2_000;

interface ExtractedFrame {
  index: number;
  timestamp: number;
  url: string;
}

/** Parse "MM:SS" timestamp string to total seconds */
function parseTimestamp(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

/** Find the frame with the closest timestamp to the target seconds */
function findClosestFrame(frames: ExtractedFrame[], targetSeconds: number): ExtractedFrame | null {
  if (frames.length === 0) return null;
  return frames.reduce((best, frame) => {
    return Math.abs(frame.timestamp - targetSeconds) < Math.abs(best.timestamp - targetSeconds)
      ? frame
      : best;
  });
}

/** Extract frames from the Python API and poll until completion. Returns frame list or null on failure. */
async function extractFrames(youtubeUrl: string): Promise<ExtractedFrame[] | null> {
  // Step 1: Submit extraction job
  const submitRes = await fetch(`${FRAME_EXTRACTOR_URL}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ youtube_url: youtubeUrl, max_frames: 20 }),
  });

  if (!submitRes.ok) {
    console.warn("Frame extraction submit failed:", submitRes.status);
    return null;
  }

  const { job_id } = await submitRes.json();
  if (!job_id) {
    console.warn("Frame extraction: no job_id in response");
    return null;
  }

  // Step 2: Poll until completed or timeout
  const deadline = Date.now() + 5 * 60 * 1_000; // max 5 min for the job itself
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, FRAME_POLL_INTERVAL_MS));

    const pollRes = await fetch(`${FRAME_EXTRACTOR_URL}/api/jobs/${job_id}`);
    if (!pollRes.ok) {
      console.warn("Frame extraction poll failed:", pollRes.status);
      return null;
    }

    const jobData = await pollRes.json();
    if (jobData.status === "completed") {
      return (jobData.frames as ExtractedFrame[]) ?? null;
    }
    if (jobData.status === "failed") {
      console.warn("Frame extraction job failed");
      return null;
    }
    // Still running — continue polling
  }

  console.warn("Frame extraction timed out");
  return null;
}

/** Build a zone_id -> image URL map from extracted frames and analyzer zones */
function buildBackgroundMap(
  analyzerData: AnalyzerOutput,
  frames: ExtractedFrame[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const zone of analyzerData.map.zones) {
    const targetSeconds = parseTimestamp(zone.background_timestamp);
    const closest = findClosestFrame(frames, targetSeconds);
    if (closest) {
      map.set(zone.zone_id, `${FRAME_EXTRACTOR_URL}${closest.url}`);
    }
  }
  return map;
}

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url");

  const [showLoading, setShowLoading] = useState(true);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [loadingDone, setLoadingDone] = useState(false);
  const fetchedRef = useRef(false);

  const initGameWithData = useGameStore((s) => s.initGameWithData);

  // Redirect to landing if no URL
  useEffect(() => {
    if (!url) {
      router.replace("/");
    }
  }, [url, router]);

  // Fetch analysis data AND frame extraction in parallel
  useEffect(() => {
    if (!url || fetchedRef.current) return;
    fetchedRef.current = true;

    // Fire MV analysis and avatar generation in parallel
    const analyzePromise = fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).then((res) => {
      if (!res.ok) return res.json().then((d) => { throw new Error(d.error || `Analysis failed (${res.status})`); });
      return res.json();
    });

    const avatarPromise = fetch("/api/generate-avatars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.ok ? res.json() : { avatars: {} })
      .then((data) => (data.avatars ?? {}) as Record<string, string>)
      .catch(() => ({} as Record<string, string>));



    // Frame extraction runs in parallel — failures are non-fatal
    const framePromise = extractFrames(url).catch((err) => {
      console.warn("Frame extraction error:", err);
      return null;
    });

    Promise.all([analyzePromise, avatarPromise])
      .then(([analyzerData, avatarMap]: [AnalyzerOutput, Record<string, string>]) => {
        // Wait for frames, but cap at FRAME_EXTRACTION_TIMEOUT_MS after analysis finishes
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), FRAME_EXTRACTION_TIMEOUT_MS)
        );

        return Promise.race([framePromise, timeoutPromise]).then((frames) => {
          if (frames && frames.length > 0) {
            const backgroundMap = buildBackgroundMap(analyzerData, frames);
            return transformAnalyzerOutput(analyzerData, avatarMap, backgroundMap);
          }
          // Graceful degradation: no backgrounds
          return transformAnalyzerOutput(analyzerData, avatarMap);
        });
      })
      .then((transformed) => {
        setGameData(transformed);
      })
      .catch((err) => {
        console.error("Analysis error:", err);
        setAnalyzeError(err.message);
      });
  }, [url]);

  const handleLoadingComplete = useCallback(() => {
    setLoadingDone(true);
  }, []);

  // Start game when loading screen is done AND data is ready
  useEffect(() => {
    if (!loadingDone || !showLoading) return;

    if (gameData) {
      initGameWithData(gameData);
      setShowLoading(false);
    }
    // If error, loadingDone will be true but we show the error screen
  }, [loadingDone, gameData, showLoading, initGameWithData]);

  if (!url) return null; // redirecting

  // Analysis failed — show error with retry
  if (analyzeError && loadingDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-6 px-4">
        <span className="text-4xl">&#9888;&#65039;</span>
        <h2 className="font-pixel text-sm text-danger">Analysis Failed</h2>
        <p className="font-pixel text-[7px] text-gray-400 text-center max-w-sm">
          {analyzeError}
        </p>
        <button
          onClick={() => router.replace("/")}
          className="font-pixel text-[8px] text-primary border border-primary/50 rounded-lg px-4 py-2 hover:bg-primary/10 transition-colors"
        >
          Try another URL
        </button>
      </div>
    );
  }

  if (showLoading) {
    return (
      <LoadingScreen
        onComplete={handleLoadingComplete}
        analyzing={!gameData && !analyzeError}
      />
    );
  }

  return <GameShell />;
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <PlayContent />
    </Suspense>
  );
}
