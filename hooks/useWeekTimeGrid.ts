"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Entry } from "@/lib/types";
import type { CalendarDay } from "@/lib/timeUtils";
import {
  minutesFromMidnight,
  timeFromMinutes,
  roundTo15Minutes,
  assignLanes as assignLanesUtil,
} from "@/lib/timeUtils";

const PX_PER_HOUR = 48;
const START_HOUR = 0;
const END_HOUR = 24;
const HOURS_SPAN = END_HOUR - START_HOUR;
const DEFAULT_VISIBLE_START_HOUR = 7;
const DEFAULT_VISIBLE_HOURS = 12;
const RESERVED_HEIGHT = 420;
const MIN_PX_PER_HOUR = 24;
const ZOOM_HOURS_OPTIONS = [6, 8, 10, 12, 14, 16, 18, 24] as const;

export const WEEK_GRID_CONSTANTS = {
  HEADER_ROW_HEIGHT: 40,
  dayStartM: START_HOUR * 60,
  dayEndM: END_HOUR * 60,
  DEFAULT_VISIBLE_START_HOUR,
};

export interface UseWeekTimeGridProps {
  week: CalendarDay[];
  todayDateStr: string;
  entriesByDay: Record<string, Entry[]>;
  onEntryClick?: (entry: Entry, dateStr: string) => void;
  onEntryDelete?: (entry: Entry, dateStr: string) => void;
  onEntryCopy?: (entry: Entry, dateStr: string) => void;
  onEntrySendToMember?: (entry: Entry, dateStr: string) => void;
  onEntryMove?: (entry: Entry, fromDateStr: string, toDateStr: string, newStartTime: string, newEndTime: string) => void;
  onAddEntry?: (dateStr: string, prefill?: { startTime: string; endTime: string; project?: string }) => void;
}

export function useWeekTimeGrid({
  week,
  todayDateStr,
  entriesByDay,
  onEntryClick,
  onEntryDelete,
  onEntryCopy,
  onEntrySendToMember,
  onEntryMove,
  onAddEntry,
}: UseWeekTimeGridProps) {
  const dayStartM = WEEK_GRID_CONSTANTS.dayStartM;
  const dayEndM = WEEK_GRID_CONSTANTS.dayEndM;

  const didMoveRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollShadow, setScrollShadow] = useState({ top: false, bottom: false });

  const [visibleHoursIndex, setVisibleHoursIndex] = useState(() => {
    const i = ZOOM_HOURS_OPTIONS.indexOf(DEFAULT_VISIBLE_HOURS as (typeof ZOOM_HOURS_OPTIONS)[number]);
    return i >= 0 ? i : 4;
  });
  const visibleHours = ZOOM_HOURS_OPTIONS[visibleHoursIndex];
  const [visibleHeight, setVisibleHeight] = useState(visibleHours * PX_PER_HOUR);

  const [dragState, setDragState] = useState<{
    dateStr: string;
    startM: number;
    endM: number;
    gridTop: number;
    gridHeight: number;
  } | null>(null);

  const [moveDragState, setMoveDragState] = useState<{
    entry: Entry;
    fromDateStr: string;
    durationM: number;
    offsetY: number;
    targetDateStr: string;
    targetStartM: number;
  } | null>(null);

  const [resizeDragState, setResizeDragState] = useState<{
    entry: Entry;
    dateStr: string;
    edge: "top" | "bottom";
    startM: number;
    endM: number;
    gridTop: number;
    gridHeight: number;
  } | null>(null);

  const [favoriteDropPreview, setFavoriteDropPreview] = useState<{
    dateStr: string;
    startM: number;
    endM: number;
  } | null>(null);

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
  }, [updateScrollShadow, week]);

  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const h = window.innerHeight - RESERVED_HEIGHT;
      if (h > 0) {
        const px = Math.max(MIN_PX_PER_HOUR, h / visibleHours);
        setVisibleHeight(px * visibleHours);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [visibleHours]);

  const pxPerHour = visibleHeight / visibleHours;
  const gridHeight = HOURS_SPAN * pxPerHour;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = WEEK_GRID_CONSTANTS.HEADER_ROW_HEIGHT + DEFAULT_VISIBLE_START_HOUR * pxPerHour;
  }, [pxPerHour]);

  const canZoomIn = visibleHoursIndex > 0;
  const canZoomOut = visibleHoursIndex < ZOOM_HOURS_OPTIONS.length - 1;

  const handleWheelZoom = useCallback(
    (e: React.WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (e.deltaY < 0 && canZoomIn) {
        setVisibleHoursIndex((i) => Math.max(0, i - 1));
      } else if (e.deltaY > 0 && canZoomOut) {
        setVisibleHoursIndex((i) => Math.min(ZOOM_HOURS_OPTIONS.length - 1, i + 1));
      }
    },
    [canZoomIn, canZoomOut]
  );

  const hours = Array.from({ length: HOURS_SPAN + 1 }, (_, i) => START_HOUR + i);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const yToMinutes = useCallback(
    (y: number, gridTop: number, gridHeight: number) => {
      const frac = Math.max(0, Math.min(1, (y - gridTop) / gridHeight));
      return Math.round(dayStartM + frac * (dayEndM - dayStartM));
    },
    [dayStartM, dayEndM]
  );

  const handleGridMouseDown = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>, dateStr: string) => {
      if (!onAddEntry) return;
      if ((ev.target as Element).closest("button")) return;
      if ((ev.target as Element).closest("[data-entry-id]")) return;
      const rect = ev.currentTarget.getBoundingClientRect();
      const startM = yToMinutes(ev.clientY, rect.top, rect.height);
      setDragState({
        dateStr,
        startM,
        endM: startM,
        gridTop: rect.top,
        gridHeight: rect.height,
      });
    },
    [onAddEntry, yToMinutes]
  );

  const handleEntryMouseDown = useCallback(
    (ev: React.MouseEvent, entry: Entry, dateStr: string) => {
      if (!entry.id || !onEntryMove) return;
      if ((ev.target as Element).closest("button[aria-haspopup]")) return;
      if ((ev.target as Element).closest("[data-resize-handle]")) return;
      ev.preventDefault();
      ev.stopPropagation();
      const startM = minutesFromMidnight(entry.startTime!);
      const endM = minutesFromMidnight(entry.endTime!);
      const durationM = endM - startM;
      const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
      const offsetY = ev.clientY - rect.top;
      setMoveDragState({
        entry,
        fromDateStr: dateStr,
        durationM,
        offsetY,
        targetDateStr: dateStr,
        targetStartM: startM,
      });
    },
    [onEntryMove]
  );

  const handleResizeMouseDown = useCallback(
    (ev: React.MouseEvent, entry: Entry, dateStr: string, edge: "top" | "bottom") => {
      if (!entry.id || !onEntryMove) return;
      ev.preventDefault();
      ev.stopPropagation();
      const startM = minutesFromMidnight(entry.startTime!);
      const endM = minutesFromMidnight(entry.endTime!);
      const gridEl = (ev.target as HTMLElement).closest("[data-week-grid-cell]");
      const rect = gridEl?.getBoundingClientRect();
      if (!rect) return;
      setResizeDragState({
        entry,
        dateStr,
        edge,
        startM,
        endM,
        gridTop: rect.top,
        gridHeight: rect.height,
      });
    },
    [onEntryMove]
  );

  const handleWindowMouseMove = useCallback(
    (ev: MouseEvent) => {
      if (resizeDragState) {
        const m = yToMinutes(ev.clientY, resizeDragState.gridTop, resizeDragState.gridHeight);
        const minDur = 15;
        setResizeDragState((prev) => {
          if (!prev) return null;
          if (prev.edge === "top") {
            const mSnap = roundTo15Minutes(m, "floor");
            const newStart = Math.max(dayStartM, Math.min(mSnap, prev.endM - minDur));
            return { ...prev, startM: newStart };
          }
          const mSnap = roundTo15Minutes(m, "ceil");
          const newEnd = Math.min(dayEndM, Math.max(mSnap, prev.startM + minDur));
          return { ...prev, endM: newEnd };
        });
      } else if (moveDragState) {
        let targetDateStr = moveDragState.targetDateStr;
        let targetStartM = moveDragState.targetStartM;
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const cell = el?.closest("[data-week-grid-cell]");
        if (cell) {
          const date = (cell as HTMLElement).dataset.date;
          if (date) {
            targetDateStr = date;
            const cellRect = cell.getBoundingClientRect();
            targetStartM = yToMinutes(ev.clientY, cellRect.top, cellRect.height);
          }
        }
        setMoveDragState((prev) => (prev ? { ...prev, targetDateStr, targetStartM } : null));
      } else if (dragState) {
        const endM = yToMinutes(ev.clientY, dragState.gridTop, dragState.gridHeight);
        setDragState((prev) => (prev ? { ...prev, endM } : null));
      }
    },
    [dragState, moveDragState, resizeDragState, yToMinutes, dayStartM, dayEndM]
  );

  const handleWindowMouseUp = useCallback(() => {
    if (resizeDragState) {
      const { entry, dateStr, startM, endM } = resizeDragState;
      setResizeDragState(null);
      const start = roundTo15Minutes(startM, "floor");
      const end = roundTo15Minutes(endM, "ceil");
      if (end - start >= 15 && start >= dayStartM && end <= dayEndM) {
        didMoveRef.current = true;
        onEntryMove?.(entry, dateStr, dateStr, timeFromMinutes(start), timeFromMinutes(end));
        setTimeout(() => {
          didMoveRef.current = false;
        }, 100);
      }
    } else if (moveDragState) {
      const { entry, fromDateStr, durationM, targetDateStr, targetStartM } = moveDragState;
      setMoveDragState(null);
      const start = roundTo15Minutes(targetStartM, "floor");
      const end = roundTo15Minutes(targetStartM + durationM, "ceil");
      const origStartM = minutesFromMidnight(entry.startTime!);
      const origEndM = minutesFromMidnight(entry.endTime!);
      const actuallyMoved = fromDateStr !== targetDateStr || start !== origStartM || end !== origEndM;
      if (actuallyMoved && start >= dayStartM && end <= dayEndM) {
        didMoveRef.current = true;
        onEntryMove?.(entry, fromDateStr, targetDateStr, timeFromMinutes(start), timeFromMinutes(end));
        setTimeout(() => {
          didMoveRef.current = false;
        }, 100);
      } else if (!actuallyMoved && entry.id) {
        onEntryClick?.(entry, fromDateStr);
      }
    } else if (dragState) {
      const { dateStr, startM, endM } = dragState;
      setDragState(null);
      const [rawStart, rawEnd] = startM <= endM ? [startM, endM] : [endM, startM];
      const start = roundTo15Minutes(rawStart, "floor");
      const end = roundTo15Minutes(rawEnd, "ceil");
      const durationM = end - start;
      if (durationM < 15) return;
      onAddEntry?.(dateStr, {
        startTime: timeFromMinutes(start),
        endTime: timeFromMinutes(end),
      });
    }
  }, [
    dragState,
    moveDragState,
    resizeDragState,
    onAddEntry,
    onEntryMove,
    onEntryClick,
    dayStartM,
    dayEndM,
  ]);

  useEffect(() => {
    if (!dragState && !moveDragState && !resizeDragState) return;
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [dragState, moveDragState, resizeDragState, handleWindowMouseMove, handleWindowMouseUp]);

  useEffect(() => {
    const clear = () => setFavoriteDropPreview(null);
    window.addEventListener("favorite-drag-end", clear);
    return () => window.removeEventListener("favorite-drag-end", clear);
  }, []);

  const setZoomIn = useCallback(() => setVisibleHoursIndex((i) => Math.max(0, i - 1)), []);
  const setZoomOut = useCallback(
    () => setVisibleHoursIndex((i) => Math.min(ZOOM_HOURS_OPTIONS.length - 1, i + 1)),
    []
  );

  const getPrefillTimes = useCallback(
    (dateStr: string): { startTime: string; endTime: string } => {
      const dayEntries = entriesByDay[dateStr] ?? [];
      let startTime = "08:00";
      let endTime = "09:00";
      const withEnd = dayEntries.filter((x) => x.endTime);
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
        endTime = `${String(Math.floor(newEndM / 60)).padStart(2, "0")}:${String(Math.round(newEndM % 60)).padStart(2, "0")}`;
      }
      return { startTime, endTime };
    },
    [entriesByDay]
  );

  const getEntriesWithLanes = useCallback(
    (dateStr: string) => {
      const entries = (entriesByDay[dateStr] ?? []).filter((e) => e.startTime && e.endTime);
      const withPos = entries.map((e) => {
        const startM = minutesFromMidnight(e.startTime!);
        const endM = minutesFromMidnight(e.endTime!);
        return { entry: e, startM, endM };
      });
      const sorted = [...withPos].sort((a, b) => a.startM - b.startM);

      const overlaps = (a: { startM: number; endM: number }, b: { startM: number; endM: number }) =>
        a.startM < b.endM && b.startM < a.endM;

      // Union-Find: verbundene Überlappungen bilden eine Component
      const parent: number[] = sorted.map((_, i) => i);
      const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          if (overlaps(sorted[i], sorted[j])) {
            parent[find(i)] = find(j);
          }
        }
      }

      // Pro Component: einheitliche Lane-Zuweisung
      const componentLanes = new Map<number, number[]>();
      const componentLaneCount = new Map<number, number>();
      for (let i = 0; i < sorted.length; i++) {
        const root = find(i);
        if (!componentLanes.has(root)) {
          const indices = sorted
            .map((_, j) => j)
            .filter((j) => find(j) === root)
            .sort((a, b) => sorted[a].startM - sorted[b].startM);
          const groupEntries = indices.map((j) => ({ startM: sorted[j].startM, endM: sorted[j].endM }));
          const groupLanes = assignLanesUtil(groupEntries);
          const idxInGroup = indices.indexOf(i);
          const laneCount = Math.max(1, ...groupLanes.map((l) => l + 1));
          componentLanes.set(root, groupLanes);
          componentLaneCount.set(root, laneCount);
        }
      }

      const lanes: number[] = [];
      const laneCounts: number[] = [];
      for (let i = 0; i < sorted.length; i++) {
        const root = find(i);
        const indices = sorted
          .map((_, j) => j)
          .filter((j) => find(j) === root)
          .sort((a, b) => sorted[a].startM - sorted[b].startM);
        const idxInGroup = indices.indexOf(i);
        const groupLanes = componentLanes.get(root)!;
        const lane = groupLanes[idxInGroup];
        const laneCount = componentLaneCount.get(root)!;
        lanes.push(lane);
        laneCounts.push(laneCount);
      }

      return { sorted, lanes, laneCounts };
    },
    [entriesByDay]
  );

  return {
    // Layout & display
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
    // Drag state
    dragState,
    moveDragState,
    resizeDragState,
    favoriteDropPreview,
    setFavoriteDropPreview,
    // Handlers
    handleGridMouseDown,
    handleEntryMouseDown,
    handleResizeMouseDown,
    // Derived
    nowMinutes,
    nowDateStr,
    dayStartM,
    dayEndM,
    getPrefillTimes,
    getEntriesWithLanes,
  };
}
