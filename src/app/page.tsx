"use client";

import { UrlInput } from "@/components/landing/UrlInput";

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 text-center">
        <div>
          <h1 className="font-pixel text-2xl md:text-4xl text-primary mb-4 leading-relaxed">
            MV ESCAPE
          </h1>
          <p className="font-pixel text-[10px] md:text-xs text-gray-300 leading-relaxed">
            Rescue the members trapped
            <br />
            inside the music video
          </p>
        </div>
        <UrlInput />
      </div>
    </main>
  );
}
