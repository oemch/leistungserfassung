"use client";

const TIMER_BAR_FONT_SIZE = 24;

interface TimerBarProps {
  elapsed: string;
  isRunning: boolean;
  startTimeFormatted: string | null;
  onPlay: () => void;
  onStop: () => void;
}

export function TimerBar({ elapsed, isRunning, startTimeFormatted, onPlay, onStop }: TimerBarProps) {
  return (
    <div className="h-16 bg-[var(--figma-bw-white)] border-b border-[var(--figma-neutral-85)] px-6 flex items-center">
      <span className="shrink-0" style={{ color: "var(--figma-bw-black)", fontSize: TIMER_BAR_FONT_SIZE, fontWeight: 400 }}>
        Heute, 23.2.2026
      </span>
      <div className="flex items-center gap-2 rounded-lg pl-1 pr-4 py-1 ml-[60px] bg-[var(--figma-neutral-97)]">
        <button
          type="button"
          onClick={onPlay}
          disabled={isRunning}
          className="p-1 rounded flex shrink-0 disabled:opacity-70 hover:opacity-80 disabled:cursor-default"
          style={{ color: isRunning ? "var(--figma-neutral-70)" : "var(--figma-primary)" }}
          aria-label="Aufnahme starten"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={!isRunning}
          className="p-1 rounded flex shrink-0 hover:opacity-80 disabled:cursor-default disabled:opacity-70"
          style={{ color: isRunning ? "var(--figma-primary)" : "var(--figma-neutral-70)" }}
          aria-label="Aufnahme stoppen"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
        </button>
        <span
          className="tabular-nums shrink-0"
          style={{
            color: isRunning ? "#100C08" : "#B5B1AD",
            fontFamily: "var(--font-coop), var(--Font, Coop)",
            fontSize: TIMER_BAR_FONT_SIZE,
            fontWeight: 400,
            fontStyle: "normal",
            lineHeight: "normal",
          }}
        >
          Dauer: {elapsed}
        </span>
        {isRunning && startTimeFormatted && (
          <span
            className="tabular-nums shrink-0"
            style={{ color: "#B5B1AD", fontSize: TIMER_BAR_FONT_SIZE, fontWeight: 400, lineHeight: 1, fontFamily: "var(--font-coop), Coop, sans-serif" }}
          >
            (Start: {startTimeFormatted})
          </span>
        )}
      </div>
      <button type="button" className="ml-auto text-sm shrink-0 hover:opacity-80" style={{ color: "var(--figma-bw-black)", fontSize: 14, fontWeight: 400 }}>
        Übersicht generieren ▾
      </button>
    </div>
  );
}
