"use client";

import type { Entry } from "@/lib/types";
import type { CalendarDay } from "@/lib/timeUtils";
import { WOCHENTAGE } from "@/lib/constants";
import { DayCell } from "./DayCell";
import { WeekTimeGrid } from "./WeekTimeGrid";
import { useRef, useEffect, useState, useCallback } from "react";

interface CalendarGridProps {
  weeks: CalendarDay[][];
  todayDateStr: string;
  displayedYear: number;
  displayedMonth: number;
  isWeekView?: boolean;
  searchTerms?: string[];
  isWeekend: (dateStr: string) => boolean;
  getHours: (dateStr: string) => string;
  entriesByDay: Record<string, Entry[]>;
  weekTotals: { total: string; deviation: string }[];
  onEntryClick?: (entry: Entry, dateStr: string) => void;
  onEntryDelete?: (entry: Entry, dateStr: string) => void;
  onEntryCopy?: (entry: Entry, dateStr: string) => void;
  onEntrySendToMember?: (entry: Entry, dateStr: string) => void;
  onEntryMove?: (entry: Entry, fromDateStr: string, toDateStr: string, newStartTime: string, newEndTime: string) => void;
  onAddEntry?: (dateStr: string, prefill?: { startTime: string; endTime: string; project?: string }) => void;
  entryContextMenu?: { entry: Entry; dateStr: string; anchorEl: HTMLElement } | null;
  setEntryContextMenu?: (v: { entry: Entry; dateStr: string; anchorEl: HTMLElement } | null) => void;
  cancelEntryContextMenuClose?: () => void;
  scheduleEntryContextMenuClose?: () => void;
}

export function CalendarGrid({
  weeks,
  todayDateStr,
  displayedYear,
  displayedMonth,
  isWeekView = false,
  searchTerms = [],
  isWeekend,
  getHours,
  entriesByDay,
  weekTotals,
  onEntryClick,
  onEntryDelete,
  onEntryCopy,
  onEntrySendToMember,
  onEntryMove,
  onAddEntry,
  entryContextMenu,
  setEntryContextMenu,
  cancelEntryContextMenuClose,
  scheduleEntryContextMenuClose,
}: CalendarGridProps) {
  const isInDisplayedMonth = (dateStr: string) => {
    if (isWeekView) return true;
    const [y, m] = dateStr.split("-").map(Number);
    return y === displayedYear && m === displayedMonth;
  };

  if (isWeekView && weeks.length > 0) {
    return (
      <WeekTimeGrid
        week={weeks[0]}
        todayDateStr={todayDateStr}
        searchTerms={searchTerms}
        isWeekend={isWeekend}
        entriesByDay={entriesByDay}
        onEntryClick={onEntryClick}
        onEntryDelete={onEntryDelete}
        onEntryCopy={onEntryCopy}
        onEntrySendToMember={onEntrySendToMember}
        onEntryMove={onEntryMove}
        onAddEntry={onAddEntry}
        entryContextMenu={entryContextMenu}
        setEntryContextMenu={setEntryContextMenu}
        cancelEntryContextMenuClose={cancelEntryContextMenuClose}
        scheduleEntryContextMenuClose={scheduleEntryContextMenuClose}
      />
    );
  }

  const gridCols = "repeat(7, minmax(180px, 1fr)) 72px";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollShadow, setScrollShadow] = useState({ top: false, bottom: false });

  const updateScrollShadow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, clientHeight, scrollHeight } = el;
    setScrollShadow({
      top: scrollTop > 4,
      bottom: scrollTop + clientHeight < scrollHeight - 4,
    });
  }, []);

  useEffect(() => {
    updateScrollShadow();
  }, [updateScrollShadow, weeks]);

  const todayWeekIndex = weeks.findIndex((w) => w.some((c) => c.dateStr === todayDateStr));

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || todayWeekIndex < 0) return;
    const id = setTimeout(() => {
      const rowHeight = 336 + 12;
      el.scrollTop = Math.max(0, todayWeekIndex * rowHeight - el.clientHeight / 2 + rowHeight / 2);
    }, 0);
    return () => clearTimeout(id);
  }, [todayWeekIndex]);

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden relative" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <div
        className={`grid gap-3 shrink-0 bg-white pb-3 transition-shadow duration-200 relative z-20 ${
          scrollShadow.top ? "shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : ""
        }`}
        style={{
          gridTemplateColumns: gridCols,
          width: "100%",
          minWidth: "1404px",
        }}
      >
        {WOCHENTAGE.map((d) => (
          <div
            key={d}
            className="text-center py-1 whitespace-nowrap overflow-hidden text-ellipsis min-w-0 text-neutral-32 font-normal text-xl leading-5"
          >
            {d}
          </div>
        ))}
        <div />
      </div>
      <div className="relative flex-1 min-h-0 min-w-0 z-0">
        <div
          ref={scrollRef}
          className="overflow-auto h-full min-w-0 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={updateScrollShadow}
        >
        <div
          className="grid gap-3 min-w-0"
          style={{
            gridTemplateColumns: gridCols,
            width: "100%",
            minWidth: "1404px",
          }}
        >
        {weeks.flatMap((week, wi) => [
          ...week.map((cell) => (
            <DayCell
              key={cell.dateStr}
              day={cell.day}
              month={cell.month}
              dateStr={cell.dateStr}
              isToday={cell.dateStr === todayDateStr}
              isWeekend={isWeekend(cell.dateStr)}
              isCurrentMonth={isInDisplayedMonth(cell.dateStr)}
              entries={entriesByDay[cell.dateStr] ?? []}
              hours={getHours(cell.dateStr)}
              searchTerms={searchTerms}
              onEntryClick={onEntryClick}
              onEntryDelete={onEntryDelete}
              onEntryCopy={onEntryCopy}
              onEntrySendToMember={onEntrySendToMember}
              onAddEntry={onAddEntry}
              entryContextMenu={entryContextMenu}
              setEntryContextMenu={setEntryContextMenu}
              cancelEntryContextMenuClose={cancelEntryContextMenuClose}
              scheduleEntryContextMenuClose={scheduleEntryContextMenuClose}
            />
          )),
          <div key={`total-${wi}`} className="flex flex-col items-end justify-start pt-2 text-sm font-medium text-right text-neutral-40">
            <span>{weekTotals[wi]?.total ?? "Ist 0 / Soll 0 h"}</span>
            <span className="text-ink">{weekTotals[wi]?.deviation ?? "+ 0 h"}</span>
          </div>,
        ])}
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
    </div>
  );
}
