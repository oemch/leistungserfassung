"use client";

const TIMER_BAR_FONT_SIZE = 24;

interface TimerBarProps {
  elapsed: string;
  isRunning: boolean;
  startTimeFormatted: string | null;
  onPlay: () => void;
  onStop: () => void;
  /** Nur bei laufendem Timer: Werte und Callbacks für die Inline-Felder. */
  inlineProject?: string | null;
  inlineTicket?: string | null;
  inlineComment?: string;
  onInlineProjectChange?: (value: string) => void;
  onInlineTicketChange?: (value: string) => void;
  onInlineCommentChange?: (value: string) => void;
  onDetailsClick?: () => void;
  projectOptions?: readonly string[];
  ticketOptions?: readonly string[];
}

export function TimerBar({
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
  projectOptions = [],
  ticketOptions = [],
}: TimerBarProps) {
  return (
    <div className="h-16 bg-[var(--figma-bw-white)] border-b border-[var(--figma-neutral-85)] px-6 flex items-center">
      <span className="shrink-0" style={{ color: "var(--figma-bw-black)", fontSize: TIMER_BAR_FONT_SIZE, fontWeight: 400 }}>
        Heute, 23.2.2026
      </span>
      <div className="flex items-center gap-2 rounded-lg pl-1 pr-4 py-1 mx-6 w-fit shrink-0" style={{ backgroundColor: "#F3F2F2" }}>
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
        {isRunning && (
          <>
            <select
              value={inlineProject ?? ""}
              onChange={(e) => onInlineProjectChange?.(e.target.value || "")}
              className="rounded border px-2 py-1 text-sm min-w-0 max-w-[140px] truncate ml-[40px]"
              style={{ borderColor: "var(--figma-neutral-85)", color: "var(--figma-bw-black)", backgroundColor: "var(--figma-bw-white)" }}
              aria-label="Projekt"
            >
              <option value="">Projekt</option>
              {projectOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <select
              value={inlineTicket ?? ""}
              onChange={(e) => onInlineTicketChange?.(e.target.value || "")}
              className="rounded border px-2 py-1 text-sm min-w-0 max-w-[140px] truncate"
              style={{ borderColor: "var(--figma-neutral-85)", color: "var(--figma-bw-black)", backgroundColor: "var(--figma-bw-white)" }}
              aria-label="Ticket(s)"
            >
              <option value="">Ticket(s)</option>
              {ticketOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <input
              type="text"
              value={inlineComment}
              onChange={(e) => onInlineCommentChange?.(e.target.value)}
              placeholder="Kommentar"
              className="rounded border px-2 py-1 text-sm min-w-0 max-w-[160px]"
              style={{ borderColor: "var(--figma-neutral-85)", color: "var(--figma-bw-black)", backgroundColor: "var(--figma-bw-white)" }}
              aria-label="Kommentar"
            />
            <button
              type="button"
              onClick={onDetailsClick}
              className="shrink-0 text-sm underline hover:no-underline"
              style={{ color: "var(--figma-bw-black)" }}
            >
              Details…
            </button>
          </>
        )}
      </div>
      <button type="button" className="ml-auto text-sm shrink-0 hover:opacity-80" style={{ color: "var(--figma-bw-black)", fontSize: 14, fontWeight: 400 }}>
        Übersicht generieren ▾
      </button>
    </div>
  );
}
