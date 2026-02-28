"use client";

import { useCallback, useRef } from "react";

interface VirtualJoystickProps {
  onDirectionStart: (key: string) => void;
  onDirectionEnd: (key: string) => void;
  onAction: () => void;
}

export function VirtualJoystick({
  onDirectionStart,
  onDirectionEnd,
  onAction,
}: VirtualJoystickProps) {
  // Track active directions to clean up on touch end
  const activeRef = useRef(new Set<string>());

  const btn =
    "w-12 h-12 rounded-lg bg-surface-light/80 border border-white/20 flex items-center justify-center text-lg select-none touch-manipulation active:bg-primary/50";

  const handleStart = useCallback(
    (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      activeRef.current.add(key);
      onDirectionStart(key);
    },
    [onDirectionStart]
  );

  const handleEnd = useCallback(
    (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      activeRef.current.delete(key);
      onDirectionEnd(key);
    },
    [onDirectionEnd]
  );

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-between items-end px-6 z-30 pointer-events-none">
      {/* D-pad */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1 pointer-events-auto">
        <div />
        <button
          className={btn}
          onTouchStart={handleStart("arrowup")}
          onTouchEnd={handleEnd("arrowup")}
          onMouseDown={handleStart("arrowup")}
          onMouseUp={handleEnd("arrowup")}
          onMouseLeave={handleEnd("arrowup")}
        >
          &#9650;
        </button>
        <div />
        <button
          className={btn}
          onTouchStart={handleStart("arrowleft")}
          onTouchEnd={handleEnd("arrowleft")}
          onMouseDown={handleStart("arrowleft")}
          onMouseUp={handleEnd("arrowleft")}
          onMouseLeave={handleEnd("arrowleft")}
        >
          &#9664;
        </button>
        <div />
        <button
          className={btn}
          onTouchStart={handleStart("arrowright")}
          onTouchEnd={handleEnd("arrowright")}
          onMouseDown={handleStart("arrowright")}
          onMouseUp={handleEnd("arrowright")}
          onMouseLeave={handleEnd("arrowright")}
        >
          &#9654;
        </button>
        <div />
        <button
          className={btn}
          onTouchStart={handleStart("arrowdown")}
          onTouchEnd={handleEnd("arrowdown")}
          onMouseDown={handleStart("arrowdown")}
          onMouseUp={handleEnd("arrowdown")}
          onMouseLeave={handleEnd("arrowdown")}
        >
          &#9660;
        </button>
        <div />
      </div>

      {/* Action button */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onAction();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onAction();
        }}
        className="w-16 h-16 rounded-full bg-primary/80 border-2 border-white/30
                   flex items-center justify-center font-pixel text-xs text-white
                   active:scale-90 transition-transform select-none touch-manipulation pointer-events-auto"
      >
        ACT
      </button>
    </div>
  );
}
