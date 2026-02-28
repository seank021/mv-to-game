"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { GameShell } from "@/components/game/GameShell";
import { useGameStore } from "@/stores/gameStore";
import { transformAnalyzerOutput, AnalyzerOutput } from "@/lib/transform";
import { GameData } from "@/lib/types";

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

  // Fetch analysis data in parallel with the loading screen
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

    Promise.all([analyzePromise, avatarPromise])
      .then(([data, avatarMap]: [AnalyzerOutput, Record<string, string>]) => {
        const transformed = transformAnalyzerOutput(data, avatarMap);
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
