"use client";

import { MoreVertical } from "lucide-react";
import type { Entry } from "@/lib/types";
import { entryHighlightClass } from "@/lib/entryUtils";
import { TaskChip } from "./TaskChip";
import { EntryLabel } from "./EntryLabel";

interface DayCellProps {
  day: number;
  month: number;
  dateStr: string;
  hours: string;
  isToday: boolean;
  isWeekend: boolean;
  isCurrentMonth: boolean;
  entries: Entry[];
  searchTerms?: string[];
  onEntryClick?: (entry: Entry, dateStr: string) => void;
  onEntryDelete?: (entry: Entry, dateStr: string) => void;
  onAddEntry?: (dateStr: string, prefill?: { startTime: string; endTime: string; project?: string }) => void;
  onEntryCopy?: (entry: Entry, dateStr: string) => void;
  onEntrySendToMember?: (entry: Entry, dateStr: string) => void;
  entryContextMenu?: { entry: Entry; dateStr: string; anchorEl: HTMLElement } | null;
  setEntryContextMenu?: (v: { entry: Entry; dateStr: string; anchorEl: HTMLElement } | null) => void;
  cancelEntryContextMenuClose?: () => void;
  scheduleEntryContextMenuClose?: () => void;
}

export function DayCell({ day, month, dateStr, hours, isToday, isWeekend, isCurrentMonth, entries, searchTerms = [], onEntryClick, onEntryDelete, onAddEntry, onEntryCopy, onEntrySendToMember, entryContextMenu, setEntryContextMenu, cancelEntryContextMenuClose, scheduleEntryContextMenuClose }: DayCellProps) {
  const isFrei = isWeekend && entries.length === 0;

  const sortedEntries = [...entries].sort((a, b) => {
    const aStart = a.startTime ? a.startTime.split(":").map(Number) : [24, 0];
    const bStart = b.startTime ? b.startTime.split(":").map(Number) : [24, 0];
    const aM = (aStart[0] ?? 0) * 60 + (aStart[1] ?? 0);
    const bM = (bStart[0] ?? 0) * 60 + (bStart[1] ?? 0);
    return aM - bM;
  });

  const getPrefillTimes = (): { startTime: string; endTime: string } => {
    let startTime = "08:00";
    let endTime = "09:00";
    if (entries.length > 0) {
      const withEnd = entries.filter((x) => x.endTime);
      if (withEnd.length > 0) {
        const last = withEnd.reduce((a, b) => {
          const [ah, am] = (a.endTime ?? "00:00").split(":").map(Number);
          const [bh, bm] = (b.endTime ?? "00:00").split(":").map(Number);
          return (ah * 60 + am) >= (bh * 60 + bm) ? a : b;
        });
        const [h, m] = (last.endTime ?? "00:00").split(":").map(Number);
        const endM = (h ?? 0) * 60 + (m ?? 0);
        const startM = endM;
        const newEndM = Math.min(24 * 60 - 15, startM + 60);
        startTime = `${String(Math.floor(startM / 60)).padStart(2, "0")}:${String(startM % 60).padStart(2, "0")}`;
        endTime = `${String(Math.floor(newEndM / 60)).padStart(2, "0")}:${String(newEndM % 60).padStart(2, "0")}`;
      }
    }
    return { startTime, endTime };
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/x-favorite")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      e.currentTarget.classList.add("ring-2", "ring-primary", "ring-offset-1");
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-primary", "ring-offset-1");
  };
  const handleDrop = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-primary", "ring-offset-1");
    const raw = e.dataTransfer.getData("application/x-favorite");
    if (!raw || !onAddEntry) return;
    try {
      const fav = JSON.parse(raw) as { label: string };
      e.preventDefault();
      const { startTime, endTime } = getPrefillTimes();
      onAddEntry(dateStr, { startTime, endTime, project: fav.label });
    } catch {}
  };

  const dimmed = !isCurrentMonth;
  const cellOpacity = dimmed ? { opacity: 0.45 } : undefined;

  return (
    <div
      className={`day-cell rounded-lg border p-3 w-full min-w-0 h-[336px] flex flex-col box-border transition-opacity ${
        dimmed
          ? "border-neutral-90 bg-neutral-97"
          : isToday
            ? "border-primary bg-primary-subtle"
            : "border-neutral-85 bg-white"
      }`}
      style={cellOpacity}
      onDragOver={dimmed ? undefined : handleDragOver}
      onDragLeave={dimmed ? undefined : handleDragLeave}
      onDrop={dimmed ? undefined : handleDrop}
    >
      <div className={`flex justify-between text-sm font-semibold mb-2 ${dimmed ? "text-neutral-50" : "text-neutral-32"}`}>
        <span>{day}.{month}.</span>
        <span>{hours}</span>
      </div>
      <div className="flex flex-col gap-1 overflow-hidden">
        {isFrei ? (
          <span className={`text-sm text-neutral-50`}>Frei</span>
        ) : entries.length === 0 ? (
          isToday && !dimmed ? (
            <span className="text-sm font-normal leading-[140%] text-ink font-sans">
              Es sind noch keine Einträge vorhanden.
            </span>
          ) : null
        ) : (
          sortedEntries.map((e, i) =>
            e.id && (onEntryClick || onEntryDelete) ? (
              <div
                key={e.id}
                className={`group relative w-full rounded min-w-0 text-xs overflow-hidden ${entryHighlightClass(e, searchTerms) ?? ""}`}
                style={{ backgroundColor: e.bg, color: e.fg }}
              >
                <button
                  type="button"
                  onClick={() => onEntryClick?.(e, dateStr)}
                  className="text-left w-full px-2 py-0.5 pr-7 rounded hover:opacity-90 transition-opacity"
                  style={{ color: e.fg }}
                >
                  {(e.startTime != null || e.endTime != null) && (
                    <span className="block truncate" style={{ lineHeight: 1.2 }}>
                      {e.startTime ?? "–"} – {e.endTime ?? "–"}
                    </span>
                  )}
                  <EntryLabel text={e.text} fg={e.fg} className={`block truncate ${e.startTime != null || e.endTime != null ? "mt-0.5" : ""}`} style={{ lineHeight: 1.2 }} />
                </button>
                {!dimmed && (onEntryClick || onEntryDelete || onEntryCopy || onEntrySendToMember) && setEntryContextMenu && cancelEntryContextMenuClose && scheduleEntryContextMenuClose && (
                  <button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
                    style={{ color: e.fg }}
                    aria-label="Menü öffnen"
                    aria-haspopup="menu"
                    aria-expanded={entryContextMenu?.entry.id === e.id}
                    onMouseEnter={(ev) => {
                      cancelEntryContextMenuClose();
                      setEntryContextMenu({ entry: e, dateStr, anchorEl: ev.currentTarget });
                    }}
                    onMouseLeave={scheduleEntryContextMenuClose}
                  >
                    <MoreVertical size={16} aria-hidden />
                  </button>
                )}
              </div>
            ) : (
              <TaskChip
                key={i}
                text={e.text}
                bg={e.bg}
                fg={e.fg}
                startTime={e.startTime}
                endTime={e.endTime}
                className={entryHighlightClass(e, searchTerms)}
              />
            )
          )
        )}
        {onAddEntry && !dimmed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const { startTime, endTime } = getPrefillTimes();
              onAddEntry(dateStr, { startTime, endTime });
            }}
            className="new-entry-hint mt-1 w-full text-sm text-ink opacity-0 transition-opacity duration-150 text-center bg-transparent border-0 cursor-pointer"
          >
            + Neue Leistung
          </button>
        )}
      </div>
    </div>
  );
}
