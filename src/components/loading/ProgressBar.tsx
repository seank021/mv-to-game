"use client";

interface ProgressBarProps {
  progress: number; // 0-100
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full max-w-xs">
      <div className="w-full h-3 bg-surface rounded-full overflow-hidden border border-surface-light">
        <div
          className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500 ease-out rounded-full"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <p className="font-pixel text-[8px] text-gray-400 mt-2 text-center">
        {Math.round(progress)}%
      </p>
    </div>
  );
}
