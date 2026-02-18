"use client";

import { Play, Square, FileDown } from "lucide-react";
import { Combobox } from "@/app/components/ui/Combobox";

const TIMER_BAR_FONT_SIZE = 16;

interface TimerBarProps {
  todayLabel: string;
  elapsed: string;
  isRunning: boolean;
  startTimeFormatted: string | null;
  onPlay: () => void;
  onStop: () => void;
  inlineProject?: string | null;
  inlineTicket?: string | null;
  inlineComment?: string;
  onInlineProjectChange?: (value: string) => void;
  onInlineTicketChange?: (value: string) => void;
  onInlineCommentChange?: (value: string) => void;
  onDetailsClick?: () => void;
  onAddEntryClick?: () => void;
  onOverviewGenerate?: () => void;
  projectOptions?: readonly string[];
  ticketOptions?: readonly string[];
}

export function TimerBar({
  todayLabel,
  elapsed,
  isRunning,
  startTimeFormatted,
  onPlay,
  onStop,
  inlineProject = null,
  inlineTicket = null,
  inlineComment = "",
  onInlineProjectChange,
  onInlineTicketChange,
  onInlineCommentChange,
  onDetailsClick,
  onAddEntryClick,
  onOverviewGenerate,
  projectOptions = [],
  ticketOptions = [],
}: TimerBarProps) {
  return (
    <div className="min-h-[72px] py-2 bg-white border-b border-neutral-85 px-6 flex items-center justify-center">
      <div className="w-full max-w-[1920px] mx-auto flex items-center">
      <span className="shrink-0 text-ink font-normal" style={{ fontSize: TIMER_BAR_FONT_SIZE }}>
        {todayLabel}
      </span>
      <div className="flex items-center gap-2 rounded-lg pl-1 pr-3 h-10 ml-4 mr-2 w-fit shrink-0" style={{ backgroundColor: "#F3F2F2" }}>
        <button
          type="button"
          onClick={onPlay}
          disabled={isRunning}
          className={`p-1 rounded flex shrink-0 disabled:opacity-70 hover:opacity-80 disabled:cursor-default ${isRunning ? "text-neutral-50" : "text-primary"}`}
          aria-label="Aufnahme starten"
        >
          <Play size={24} fill="currentColor" strokeWidth={0} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={!isRunning}
          className={`p-1 rounded flex shrink-0 hover:opacity-80 disabled:cursor-default disabled:opacity-70 ${isRunning ? "text-primary" : "text-neutral-50"}`}
          aria-label="Aufnahme stoppen"
        >
          <Square size={24} fill="currentColor" strokeWidth={0} aria-hidden />
        </button>
        <span
          className="tabular-nums shrink-0"
          style={{
            color: isRunning ? "#100C08" : "var(--color-neutral-50)",
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
            style={{ color: "var(--color-neutral-50)", fontSize: TIMER_BAR_FONT_SIZE, fontWeight: 400, lineHeight: 1, fontFamily: "var(--font-coop), Coop, sans-serif" }}
          >
            (Start: {startTimeFormatted})
          </span>
        )}
        {isRunning && (
          <>
            <div className="min-w-0 max-w-[220px] ml-4 shrink-0">
              <Combobox
                value={inlineProject}
                onChange={(v) => onInlineProjectChange?.(v ?? "")}
                options={projectOptions}
                placeholder="Leistung wählen"
                compact
                ariaLabel="Leistung"
              />
            </div>
            <div className="min-w-0 max-w-[140px] shrink-0">
              <Combobox
                value={inlineTicket}
                onChange={(v) => onInlineTicketChange?.(v ?? "")}
                options={ticketOptions}
                placeholder="Ticket(s)"
                compact
                ariaLabel="Ticket(s)"
              />
            </div>
            <input
              type="text"
              value={inlineComment}
              onChange={(e) => onInlineCommentChange?.(e.target.value)}
              placeholder="Kommentar"
              className="rounded border border-neutral-85 px-2 py-1 text-sm min-w-0 max-w-[160px] text-ink bg-white"
              aria-label="Kommentar"
            />
            <button
              type="button"
              onClick={onDetailsClick}
              className="shrink-0 text-sm underline hover:no-underline text-ink"
            >
              Details…
            </button>
          </>
        )}
      </div>
      {onAddEntryClick && (
        <button
          type="button"
          onClick={onAddEntryClick}
          className="flex items-center gap-1.5 rounded-lg h-10 px-2.5 ml-2 shrink-0 hover:opacity-90 transition-opacity text-sm bg-primary text-white font-medium"
          aria-label="Neue Leistung"
        >
          <span aria-hidden>+</span>
          Neue Leistung
        </button>
      )}
      <button
        type="button"
        onClick={onOverviewGenerate}
        className="ml-auto flex items-center gap-2 shrink-0 hover:opacity-80 text-ink font-normal text-base"
      >
        Monatsjournal herunterladen
        <FileDown size={20} aria-hidden />
      </button>
      </div>
    </div>
  );
}
