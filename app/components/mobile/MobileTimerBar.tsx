"use client";

import { Play, Square } from "lucide-react";

interface MobileTimerBarProps {
  elapsed: string;
  isRunning: boolean;
  startTimeFormatted: string | null;
  onPlay: () => void;
  onStop: () => void;
}

export function MobileTimerBar({
  elapsed,
  isRunning,
  startTimeFormatted,
  onPlay,
  onStop,
}: MobileTimerBarProps) {
  return (
    <div className="shrink-0 bg-neutral-97 border-b border-neutral-85 pt-[env(safe-area-inset-top,0px)] pb-0.5">
      <div className="flex items-center w-full">
        <div className="flex items-center gap-2 pl-2 pr-3 h-11 w-full">
          <button
            type="button"
            onClick={onPlay}
            disabled={isRunning}
            className={`p-2 rounded flex shrink-0 disabled:opacity-60 ${isRunning ? "text-neutral-50" : "text-primary"}`}
            aria-label="Aufnahme starten"
          >
            <Play size={28} fill="currentColor" strokeWidth={0} aria-hidden />
          </button>
          <button
            type="button"
            onClick={onStop}
            disabled={!isRunning}
            className={`p-2 rounded flex shrink-0 ${isRunning ? "text-primary" : "text-neutral-50"} disabled:opacity-60`}
            aria-label="Aufnahme stoppen"
          >
            <Square size={28} fill="currentColor" strokeWidth={0} aria-hidden />
          </button>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="tabular-nums text-ink font-medium text-base">
              {elapsed}
            </span>
            {isRunning && startTimeFormatted && (
              <span className="tabular-nums text-neutral-50 text-xs">
                Start: {startTimeFormatted}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
