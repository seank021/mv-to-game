"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PixelButton } from "@/components/ui/PixelButton";

function isValidYouTubeUrl(url: string): boolean {
  const pattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/;
  return pattern.test(url);
}

export function UrlInput() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }
    if (!isValidYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }
    setError("");
    // Pass URL as query param so the play page can analyze it
    router.push(`/play?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <input
        type="text"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Paste a YouTube MV URL here"
        className="w-full px-4 py-3 rounded-lg bg-surface border border-surface-light
                   text-white placeholder-gray-500 focus:outline-none focus:border-primary
                   focus:ring-1 focus:ring-primary transition-colors text-sm"
      />
      {error && (
        <p className="text-danger text-xs font-pixel">{error}</p>
      )}
      <PixelButton onClick={handleSubmit} disabled={!url.trim()}>
        Start
      </PixelButton>
    </div>
  );
}
