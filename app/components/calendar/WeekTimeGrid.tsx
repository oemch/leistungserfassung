"use client";

import { MoreVertical, ZoomIn, ZoomOut } from "lucide-react";
import type { Entry } from "@/lib/types";
import type { CalendarDay } from "@/lib/timeUtils";
import { timeFromMinutes, roundTo15Minutes, parseDateLocal } from "@/lib/timeUtils";
import { WOCHENTAGE } from "@/lib/constants";
import { entryHighlightClass } from "@/lib/entryUtils";
import { EntryLabel } from "./EntryLabel";
import { useWeekTimeGrid, WEEK_GRID_CONSTANTS } from "@/hooks/useWeekTimeGrid";

interface WeekTimeGridProps {
  week: CalendarDay[];
  todayDateStr: string;
  searchTerms?: string[];
  isWeekend: (dateStr: string) => boolean;
  entriesByDay: Record<string, Entry[]>;
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

export function WeekTimeGrid({
  week,
  todayDateStr,
  searchTerms = [],
  isWeekend,
  entriesByDay,
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
}: WeekTimeGridProps) {
  const {
    scrollRef,
    scrollShadow,
    updateScrollShadow,
    visibleHeight,
    pxPerHour,
    gridHeight,
    hours,
    canZoomIn,
    canZoomOut,
    setZoomIn,
    setZoomOut,
    handleWheelZoom,
    didMoveRef,
    dragState,
    moveDragState,
    resizeDragState,
    favoriteDropPreview,
    setFavoriteDropPreview,
    handleGridMouseDown,
    handleEntryMouseDown,
    handleResizeMouseDown,
    nowMinutes,
    nowDateStr,
    dayStartM,
    dayEndM,
    getPrefillTimes,
    getEntriesWithLanes,
  } = useWeekTimeGrid({
    week,
    todayDateStr,
    entriesByDay,
    onEntryClick,
    onEntryDelete,
    onEntryCopy,
    onEntrySendToMember,
    onEntryMove,
    onAddEntry,
  });

  const { HEADER_ROW_HEIGHT } = WEEK_GRID_CONSTANTS;
  const START_HOUR = 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full max-w-[1920px] mx-auto overflow-hidden relative">
      <div
        ref={scrollRef}
        className="overflow-auto min-w-0 flex-1 min-h-0 [&::-webkit-scrollbar]:hidden"
        style={{
          maxHeight: visibleHeight + HEADER_ROW_HEIGHT,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onScroll={updateScrollShadow}
        onWheel={handleWheelZoom}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setFavoriteDropPreview(null);
          }
        }}
      >
        <div
          className="min-w-0"
          style={{
            display: "grid",
            gridTemplateColumns: week.length === 1 ? "64px 1fr" : "64px repeat(7, minmax(140px, 1fr))",
            minWidth: week.length === 1 ? "320px" : "1100px",
          }}
        >
          <div
            className={`sticky top-0 z-30 bg-white flex items-center gap-0.5 pr-1 transition-shadow duration-200 ${scrollShadow.top ? "shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : ""}`}
          >
            <button
              type="button"
              onClick={setZoomIn}
              disabled={!canZoomIn}
              className="p-1 rounded hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Vergrößern (weniger Stunden sichtbar)"
            >
              <ZoomIn size={16} className="text-neutral-40" />
            </button>
            <button
              type="button"
              onClick={setZoomOut}
              disabled={!canZoomOut}
              className="p-1 rounded hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Verkleinern (mehr Stunden sichtbar)"
            >
              <ZoomOut size={16} className="text-neutral-40" />
            </button>
          </div>
          {week.map((cell) => {
            const isToday = cell.dateStr === todayDateStr;
            return (
              <div
                key={cell.dateStr}
                className={`sticky top-0 z-30 bg-white text-center py-1 whitespace-nowrap overflow-hidden text-ellipsis min-w-0 transition-shadow duration-200 text-sm ${isToday ? "font-semibold text-primary" : "font-normal text-neutral-32"} ${scrollShadow.top ? "shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : ""}`}
              >
                {isToday ? "Heute, " : ""}
                {WOCHENTAGE[((parseDateLocal(cell.dateStr).getDay() + 6) % 7)]} {cell.day}.{cell.month}.
              </div>
            );
          })}

          <div
            className="relative border-r border-neutral-90 pr-1 shrink-0"
            style={{ height: gridHeight }}
          >
            <div className="relative" style={{ height: gridHeight }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="flex items-center gap-1"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: (h - START_HOUR) * pxPerHour,
                    transform: "translateY(-50%)",
                    width: "100%",
                  }}
                >
                  <span className="text-xs shrink-0 text-neutral-40">{String(h).padStart(2, "0")}:00</span>
                  <div className="flex-1 border-t border-dotted border-neutral-90" />
                </div>
              ))}
            </div>
          </div>

          {week.map((cell) => {
            const { sorted, lanes, laneCounts } = getEntriesWithLanes(cell.dateStr);
            const isToday = cell.dateStr === todayDateStr;
            const showNowLine =
              isToday && nowDateStr === cell.dateStr && nowMinutes >= dayStartM && nowMinutes <= dayEndM;

            const handleDayDragOver = (e: React.DragEvent) => {
              if (e.dataTransfer.types.includes("application/x-favorite")) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                const rect = e.currentTarget.getBoundingClientRect();
                const localY = e.clientY - rect.top;
                const dropMinutes = dayStartM + (localY / rect.height) * (dayEndM - dayStartM);
                const snapM = roundTo15Minutes(Math.max(dayStartM, Math.min(dayEndM - 60, dropMinutes)), "floor");
                const endM = Math.min(dayEndM, snapM + 60);
                setFavoriteDropPreview({ dateStr: cell.dateStr, startM: snapM, endM });
              }
            };
            const handleDayDrop = (e: React.DragEvent) => {
              const raw = e.dataTransfer.getData("application/x-favorite");
              if (!raw || !onAddEntry) return;
              try {
                const fav = JSON.parse(raw) as { label: string };
                e.preventDefault();
                setFavoriteDropPreview(null);
                const rect = e.currentTarget.getBoundingClientRect();
                const localY = e.clientY - rect.top;
                const dropMinutes = dayStartM + (localY / rect.height) * (dayEndM - dayStartM);
                const snapM = roundTo15Minutes(Math.max(dayStartM, Math.min(dayEndM - 60, dropMinutes)), "floor");
                const startStr = timeFromMinutes(snapM);
                const endStr = timeFromMinutes(snapM + 60);
                onAddEntry(cell.dateStr, { startTime: startStr, endTime: endStr, project: fav.label });
              } catch {}
            };

            return (
              <div
                key={cell.dateStr}
                className={`relative shrink-0 border-r border-neutral-90 ${isToday ? "border-l-2 border-l-primary bg-primary-subtle" : ""}`}
                style={{ height: gridHeight }}
                onDragOver={handleDayDragOver}
                onDrop={handleDayDrop}
              >
                <div
                  className={`relative select-none ${onAddEntry ? "cursor-crosshair" : ""}`}
                  style={{
                    height: gridHeight,
                    backgroundImage: `repeating-linear-gradient(
                      to bottom,
                      transparent,
                      transparent ${pxPerHour - 1}px,
                      var(--color-neutral-95) 1px
                    )`,
                  }}
                  data-week-grid-cell
                  data-date={cell.dateStr}
                  onMouseDown={(ev) => handleGridMouseDown(ev, cell.dateStr)}
                >
                  {favoriteDropPreview?.dateStr === cell.dateStr && (
                    <div
                      className="absolute left-1 right-1 rounded z-[22] pointer-events-none border-2 border-dashed flex items-center justify-center"
                      style={{
                        top: (favoriteDropPreview.startM - dayStartM) / 60 * pxPerHour,
                        height: (favoriteDropPreview.endM - favoriteDropPreview.startM) / 60 * pxPerHour,
                        backgroundColor: "rgba(4, 119, 91, 0.15)",
                        borderColor: "var(--color-primary)",
                        color: "var(--color-primary)",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    >
                      {timeFromMinutes(favoriteDropPreview.startM)} – {timeFromMinutes(favoriteDropPreview.endM)}
                    </div>
                  )}
                  {moveDragState?.targetDateStr === cell.dateStr && (
                    <div
                      className="absolute left-1 right-1 rounded z-[25] pointer-events-none border-2 border-dashed"
                      style={{
                        top: (roundTo15Minutes(moveDragState.targetStartM, "floor") - dayStartM) / 60 * pxPerHour,
                        height: moveDragState.durationM / 60 * pxPerHour,
                        backgroundColor: "rgba(4, 119, 91, 0.2)",
                        borderColor: "var(--color-primary)",
                      }}
                    />
                  )}
                  {dragState?.dateStr === cell.dateStr &&
                    (() => {
                      const rawStart = Math.min(dragState.startM, dragState.endM);
                      const rawEnd = Math.max(dragState.startM, dragState.endM);
                      const snapStart = roundTo15Minutes(rawStart, "floor");
                      const snapEnd = roundTo15Minutes(rawEnd, "ceil");
                      const top = (snapStart - dayStartM) / 60 * pxPerHour;
                      const height = Math.max(4, (snapEnd - snapStart) / 60 * pxPerHour);
                      const startStr = timeFromMinutes(snapStart);
                      const endStr = timeFromMinutes(snapEnd);
                      return (
                        <div
                          className="absolute left-1 right-1 rounded z-30 pointer-events-none overflow-hidden flex flex-col justify-start px-1.5 pt-1"
                          style={{
                            top,
                            height,
                            backgroundColor: "rgba(4, 119, 91, 0.25)",
                            border: "2px solid var(--color-primary)",
                            color: "var(--color-primary)",
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          <span className="truncate">
                            {startStr} – {endStr}
                          </span>
                        </div>
                      );
                    })()}
                  {sorted.map(({ entry, startM, endM }, i) => {
                    const lane = lanes[i];
                    const laneCount = laneCounts[i];
                    const isResizing = resizeDragState?.entry.id === entry.id;
                    const dispStart = isResizing ? resizeDragState!.startM : startM;
                    const dispEnd = isResizing ? resizeDragState!.endM : endM;
                    const top = Math.max(0, (dispStart - dayStartM) / 60 * pxPerHour);
                    const h = Math.max(4, (dispEnd - dispStart) / 60 * pxPerHour);
                    const leftPercent = (lane / laneCount) * 100;
                    const widthPercent = 100 / laneCount - 2;

                    return (
                      <div
                        key={entry.id ?? i}
                        data-entry-id={entry.id}
                        className={`group absolute left-0.5 right-0.5 rounded overflow-visible z-10 flex flex-col items-stretch justify-start text-xs ${onEntryMove && entry.id ? "cursor-grab active:cursor-grabbing" : ""} ${entryHighlightClass(entry, searchTerms) ?? ""}`}
                        style={{
                          top,
                          height: h,
                          left: `calc(${leftPercent}% + 2px)`,
                          width: `calc(${widthPercent}% - 4px)`,
                          backgroundColor: entry.bg,
                          color: entry.fg,
                          opacity: moveDragState?.entry.id === entry.id ? 0.4 : 1,
                        }}
                        onMouseDown={(ev) => handleEntryMouseDown(ev, entry, cell.dateStr)}
                        onContextMenu={(ev) => {
                          ev.preventDefault();
                          if (entry.id && (onEntryClick || onEntryDelete || onEntryCopy) && setEntryContextMenu) {
                            setEntryContextMenu({ entry, dateStr: cell.dateStr, anchorEl: ev.currentTarget });
                          }
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (didMoveRef.current) {
                              didMoveRef.current = false;
                              return;
                            }
                            entry.id && onEntryClick?.(entry, cell.dateStr);
                          }}
                          className="text-left w-full px-1.5 pt-1 pb-0.5 pr-6 rounded hover:opacity-90 transition-opacity flex flex-col items-stretch justify-start min-w-0 text-xs"
                          style={{ color: entry.fg }}
                        >
                          <span className="block truncate font-normal">
                            {week.length === 1
                              ? `${entry.startTime} – ${entry.endTime}`
                              : `${entry.startTime}–${entry.endTime}`}
                          </span>
                          <EntryLabel text={entry.text} fg={entry.fg} className="block truncate" />
                        </button>
                        {entry.id && (onEntryClick || onEntryDelete || onEntryCopy || onEntrySendToMember) && setEntryContextMenu && cancelEntryContextMenuClose && scheduleEntryContextMenuClose && (
                          <button
                            type="button"
                            className="absolute right-0.5 top-1 flex items-center justify-center w-5 h-5 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
                            style={{ color: entry.fg }}
                            aria-label="Menü öffnen"
                            aria-haspopup="menu"
                            aria-expanded={entryContextMenu?.entry.id === entry.id}
                            onMouseEnter={(ev) => {
                              cancelEntryContextMenuClose?.();
                              setEntryContextMenu?.({ entry, dateStr: cell.dateStr, anchorEl: ev.currentTarget });
                            }}
                            onMouseLeave={scheduleEntryContextMenuClose}
                          >
                            <MoreVertical size={16} aria-hidden />
                          </button>
                        )}
                        {entry.id && onEntryMove && h >= 20 && (
                          <>
                            <div
                              data-resize-handle
                              className="absolute left-0 right-0 top-0 h-2 cursor-n-resize z-[15] group-hover:bg-black/5"
                              style={{ marginTop: -2 }}
                              onMouseDown={(ev) => handleResizeMouseDown(ev, entry, cell.dateStr, "top")}
                              aria-label="Oberkante verschieben"
                            />
                            <div
                              data-resize-handle
                              className="absolute left-0 right-0 bottom-0 h-2 cursor-n-resize z-[15] group-hover:bg-black/5"
                              style={{ marginBottom: -2 }}
                              onMouseDown={(ev) => handleResizeMouseDown(ev, entry, cell.dateStr, "bottom")}
                              aria-label="Unterkante verschieben"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                  {showNowLine && (
                    <div
                      className="absolute left-0 right-0 h-0 pointer-events-none z-20"
                      style={{
                        top: (nowMinutes - dayStartM) / 60 * pxPerHour,
                      }}
                    >
                      <div
                        className="absolute left-0 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rotate-45"
                        style={{ backgroundColor: "var(--color-danger)" }}
                      />
                      <div
                        className="absolute left-0 right-0 h-px"
                        style={{ backgroundColor: "var(--color-danger)" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div
            className={`sticky bottom-0 z-10 bg-white border-t border-neutral-90 transition-shadow duration-200 ${scrollShadow.bottom ? "shadow-[0_-2px_8px_rgba(0,0,0,0.06)]" : ""}`}
          />
          {week.map((cell) => {
            return (
              <div
                key={cell.dateStr}
                className={`sticky bottom-0 z-10 bg-white border-t border-neutral-90 py-1 transition-shadow duration-200 ${scrollShadow.bottom ? "shadow-[0_-2px_8px_rgba(0,0,0,0.06)]" : ""}`}
              >
                {onAddEntry ? (
                  <button
                    type="button"
                    onClick={() => {
                      const { startTime, endTime } = getPrefillTimes(cell.dateStr);
                      onAddEntry(cell.dateStr, { startTime, endTime });
                    }}
                    className="w-full text-xs text-ink opacity-60 hover:opacity-100 transition-opacity text-center bg-transparent border-0 cursor-pointer"
                  >
                    + Neue Leistung
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
