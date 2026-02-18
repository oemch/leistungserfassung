"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Calendar, MoreVertical, Ticket } from "lucide-react";
import { SiJira } from "react-icons/si";
import type { Entry } from "@/lib/types";
import { extractJiraTicketId, getJiraUrl, isProjectEntry, isItsmTicketId } from "@/lib/jira";
import { getItsmUrl } from "@/lib/itsm";
import {
  effectiveHoursForDisplay,
  formatHoursDecimal,
  formatDateLong,
  getMondayOfWeek,
  getWeekLabel,
  getISOWeekNumber,
} from "@/lib/timeUtils";

interface ListViewProps {
  weeks: { dateStr: string; day: number; month: number }[][];
  weekTotals?: { total: string; deviation: string }[];
  displayedYear: number;
  displayedMonth: number;
  todayDateStr: string;
  entriesByDay: Record<string, Entry[]>;
  getHours?: (dateStr: string) => string;
  searchTerms?: string[];
  onEntryClick?: (entry: Entry, dateStr: string) => void;
  entryContextMenu?: { entry: Entry; dateStr: string; anchorEl: HTMLElement } | null;
  setEntryContextMenu?: (v: { entry: Entry; dateStr: string; anchorEl: HTMLElement } | null) => void;
  cancelEntryContextMenuClose?: () => void;
  scheduleEntryContextMenuClose?: () => void;
  onEntryDelete?: (entry: Entry, dateStr: string) => void;
  onEntryCopy?: (entry: Entry, dateStr: string) => void;
  onEntrySendToMember?: (entry: Entry, dateStr: string) => void;
}

export function ListView({
  weeks,
  weekTotals = [],
  displayedYear,
  displayedMonth,
  todayDateStr,
  entriesByDay,
  searchTerms = [],
  onEntryClick,
  entryContextMenu,
  setEntryContextMenu,
  cancelEntryContextMenuClose,
  scheduleEntryContextMenuClose,
  onEntryDelete,
  onEntryCopy,
  onEntrySendToMember,
  getHours,
}: ListViewProps) {
  const flatCells = weeks.flat();
  const isInMonth = (dateStr: string) => {
    const [y, m] = dateStr.split("-").map(Number);
    return y === displayedYear && m === displayedMonth;
  };

  const daysInMonth = flatCells
    .filter((c) => isInMonth(c.dateStr))
    .filter((c) => {
      const entries = (entriesByDay[c.dateStr] ?? []).filter((e) => e.startTime && e.endTime);
      const isFuture = c.dateStr > todayDateStr;
      return !isFuture || entries.length > 0;
    })
    .sort((a, b) => b.dateStr.localeCompare(a.dateStr));

  const listItems = useMemo(() => {
    type Item =
      | { type: "day"; cell: { dateStr: string; day: number; month: number } }
      | { type: "weekTotal"; mondayStr: string; weekIndex: number };
    const items: Item[] = [];
    let prevMondayStr: string | null = null;
    for (const cell of daysInMonth) {
      const mondayStr = getMondayOfWeek(cell.dateStr);
      if (mondayStr !== prevMondayStr) {
        const weekIndex = weeks.findIndex((w) => w[0]?.dateStr === mondayStr);
        if (weekIndex >= 0) {
          items.push({ type: "weekTotal", mondayStr, weekIndex });
        }
        prevMondayStr = mondayStr;
      }
      items.push({ type: "day", cell });
    }
    return items;
  }, [daysInMonth, weeks]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollShadow, setScrollShadow] = useState({ top: false, bottom: false });

  const updateScrollShadow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, clientHeight, scrollHeight } = el;
    const next = {
      top: scrollTop > 4,
      bottom: scrollTop + clientHeight < scrollHeight - 4,
    };
    setScrollShadow((prev) =>
      prev.top === next.top && prev.bottom === next.bottom ? prev : next
    );
  }, []);

  useEffect(() => {
    updateScrollShadow();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollShadow);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollShadow]);

  return (
    <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={updateScrollShadow}
      >
        <div
          className="max-w-[1920px] mx-auto pt-0 pb-4"
          style={{ "--list-week-total-height": "60px" } as React.CSSProperties}
        >
        {listItems.map((item, idx) => {
          if (item.type === "weekTotal") {
            const wt = weekTotals[item.weekIndex];
            return (
              <div
                key={`week-${item.mondayStr}`}
                className="sticky top-0 z-30 grid gap-4 px-4 py-3 pr-12 mb-4 rounded-lg bg-primary-subtle items-center border border-primary/20"
                style={{
                  gridTemplateColumns: "minmax(0,2fr) minmax(90px,1fr) minmax(80px,1fr) minmax(0,2fr) 80px",
                }}
              >
                <span className="text-sm font-semibold text-ink">
                  KW {getISOWeekNumber(item.mondayStr)} | {getWeekLabel(item.mondayStr)}
                </span>
                <div />
                <div />
                <div />
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {wt?.total ?? "Ist 0 / Soll 0 h"}
                  </span>
                  <span className="text-xs text-neutral-40 tabular-nums">
                    {wt?.deviation ?? "+ 0 h"}
                  </span>
                </div>
              </div>
            );
          }
          const cell = item.cell;
          const entries = (entriesByDay[cell.dateStr] ?? []).filter(
            (e) => e.startTime && e.endTime
          );
          const totalHours = entries.reduce(
            (acc, e) => acc + effectiveHoursForDisplay(e.startTime!, e.endTime!, e.text),
            0
          );
          const isToday = cell.dateStr === todayDateStr;
          const hoursDisplay = getHours
            ? getHours(cell.dateStr)
            : totalHours > 0
              ? `${formatHoursDecimal(totalHours)} h`
              : "—";
          const showHours = hoursDisplay !== "0 h" ? hoursDisplay : "—";

          return (
            <div key={cell.dateStr} className="mb-6">
              <div
                className={`sticky z-20 grid gap-4 px-4 py-2.5 pr-12 rounded-t-lg items-center ${
                  isToday ? "bg-primary-subtle" : "bg-neutral-97"
                }`}
                style={{
                  top: "var(--list-week-total-height, 60px)",
                  gridTemplateColumns: "minmax(0,2fr) minmax(90px,1fr) minmax(80px,1fr) minmax(0,2fr) 80px",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar
                    size={18}
                    className={`shrink-0 ${isToday ? "text-primary" : "text-neutral-40"}`}
                    aria-hidden
                  />
                  <span
                    className={`text-sm font-medium truncate ${
                      isToday ? "text-primary" : "text-ink"
                    }`}
                  >
                    {formatDateLong(cell.dateStr)}
                  </span>
                </div>
                <div />
                <div />
                <div />
                <span className="text-sm font-medium text-neutral-40 text-right tabular-nums">
                  {showHours}
                </span>
              </div>
              <div className="border border-t-0 border-neutral-85 rounded-b-lg overflow-hidden">
                {entries.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-neutral-50 text-center">
                    Keine Einträge
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-90">
                    {entries.map((entry) => {
                      const hours = effectiveHoursForDisplay(
                        entry.startTime!,
                        entry.endTime!,
                        entry.text
                      );
                      const hasSearchMatch =
                        searchTerms.length > 0 &&
                        searchTerms.some(
                          (t) =>
                            entry.text.toLowerCase().includes(t.toLowerCase()) ||
                            (entry.comment &&
                              entry.comment.toLowerCase().includes(t.toLowerCase()))
                        );

                      const hasContextMenu =
                        entry.id &&
                        (onEntryClick || onEntryDelete || onEntryCopy || onEntrySendToMember) &&
                        setEntryContextMenu &&
                        cancelEntryContextMenuClose &&
                        scheduleEntryContextMenuClose;

                      return (
                        <div
                          key={entry.id ?? entry.text + entry.startTime}
                          className={`group relative ${
                            hasSearchMatch ? "ring-inset ring-2 ring-primary" : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => entry.id && onEntryClick?.(entry, cell.dateStr)}
                            onContextMenu={(ev) => {
                              ev.preventDefault();
                              if (hasContextMenu) {
                                setEntryContextMenu!({ entry, dateStr: cell.dateStr, anchorEl: ev.currentTarget });
                              }
                            }}
                            onMouseEnter={hasContextMenu ? cancelEntryContextMenuClose : undefined}
                            onMouseLeave={hasContextMenu ? scheduleEntryContextMenuClose : undefined}
                            className="w-full text-left grid gap-4 px-4 py-3 pr-12 hover:bg-neutral-97 transition-colors"
                            style={{
                              gridTemplateColumns: "minmax(0,2fr) minmax(90px,1fr) minmax(80px,1fr) minmax(0,2fr) 80px",
                            }}
                          >
                            <span className="truncate text-sm text-ink font-semibold">
                              {entry.text}
                            </span>
                            <span className="text-sm text-neutral-50 tabular-nums truncate">
                              {entry.startTime && entry.endTime ? `${entry.startTime} – ${entry.endTime}` : "—"}
                            </span>
                            <div className="min-w-0">
                              {(() => {
                                const ticketId = extractJiraTicketId(entry.text);
                                if (!ticketId || !isProjectEntry(entry.text)) return <span className="text-sm text-neutral-50">—</span>;
                                const itsm = isItsmTicketId(ticketId);
                                const url = itsm ? getItsmUrl(ticketId) : getJiraUrl(ticketId);
                                const LinkIcon = itsm ? Ticket : SiJira;
                                const linkClass = itsm ? "text-amber-700 hover:text-amber-800" : "text-blue-600 hover:text-blue-700";
                                return (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className={`inline-flex items-center gap-1 w-fit text-sm ${linkClass} transition-colors`}
                                    aria-label={itsm ? `ITSM-Ticket ${ticketId} öffnen` : `Jira-Ticket ${ticketId} öffnen`}
                                  >
                                    <span className="inline-flex shrink-0 -translate-y-px">
                                      <LinkIcon size={14} aria-hidden />
                                    </span>
                                    {ticketId}
                                  </a>
                                );
                              })()}
                            </div>
                            <span className="truncate text-sm text-neutral-50">
                              {entry.comment || "—"}
                            </span>
                            <span className="text-sm text-neutral-40 text-right tabular-nums">
                              {formatHoursDecimal(hours)} h
                            </span>
                          </button>
                          {hasContextMenu && (
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded hover:bg-neutral-80/30 transition-colors"
                              aria-label="Menü öffnen"
                              aria-haspopup="menu"
                              aria-expanded={entryContextMenu?.entry.id === entry.id}
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={(ev) => {
                                cancelEntryContextMenuClose();
                                setEntryContextMenu({ entry, dateStr: cell.dateStr, anchorEl: ev.currentTarget });
                              }}
                              onMouseLeave={scheduleEntryContextMenuClose}
                            >
                              <MoreVertical size={18} aria-hidden />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
      {scrollShadow.bottom && (
        <div
          className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none z-20"
          style={{ boxShadow: "inset 0 -8px 12px -4px rgba(0,0,0,0.06)" }}
          aria-hidden
        />
      )}
    </div>
  );
}
