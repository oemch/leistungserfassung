"use client";

import { useRef, useEffect, useState } from "react";
import type { Entry } from "@/lib/types";
import type { CalendarDay } from "@/lib/timeUtils";
import { getCalendarDaysForMonth, getMondayOfWeek, getISOWeekNumber, effectiveHoursForDisplay, formatHoursDecimal } from "@/lib/timeUtils";
import { entryMatchesSearch } from "@/lib/entryUtils";
import { WOCHENTAGE_KURZ } from "@/lib/constants";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function hoursForDay(entries: Entry[]): number {
  return entries.reduce((acc, e) => {
    if (!e.startTime || !e.endTime) return acc;
    return acc + effectiveHoursForDisplay(e.startTime, e.endTime, e.text);
  }, 0);
}

interface YearViewProps {
  year: number;
  todayDateStr: string;
  entriesByDay: Record<string, Entry[]>;
  searchTerms?: string[];
  onMonthClick: (year: number, month: number) => void;
  onDayClick?: (dateStr: string) => void;
  onWeekClick?: (mondayStr: string) => void;
}

export function YearView({
  year,
  todayDateStr,
  entriesByDay,
  searchTerms = [],
  onMonthClick,
  onDayClick,
  onWeekClick,
}: YearViewProps) {
  const [ty, tm] = todayDateStr.split("-").map(Number);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 800, height: 600 };
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cols = Math.max(2, Math.min(4, Math.floor(size.w / 320)));
  const rows = Math.ceil(12 / cols);
  const monthW = size.w / cols - 16;
  const monthMinH = 300;
  const monthH = Math.max(monthMinH, size.h / rows - 12);

  return (
    <div ref={containerRef} className="flex-1 min-h-0 overflow-auto">
      <div
        className="grid gap-4 pt-4 px-4 pb-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(${monthMinH}px, 1fr))`,
          width: "100%",
          minHeight: rows * monthMinH + (rows - 1) * 16 + 16,
        }}
      >
        {MONTH_NAMES.map((name, monthIndex) => {
          const month = monthIndex + 1;
          const { weeks } = getCalendarDaysForMonth(year, month);
          const totalHours = weeks
            .flat()
            .filter((c) => c.month === month)
            .reduce((acc, c) => acc + hoursForDay(entriesByDay[c.dateStr] ?? []), 0);
          const isCurrentMonth = year === ty && month === tm;

          return (
            <button
              key={month}
              type="button"
              onClick={() => onMonthClick(year, month)}
              className={`text-left rounded-lg border transition-colors hover:bg-neutral-97 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 flex flex-col min-h-0 pt-4 px-4 pb-3 ${
                isCurrentMonth ? "border-primary" : "border-neutral-90"
              }`}
            >
              <div
                className="font-medium shrink-0 mb-2"
                style={{
                  fontSize: Math.min(14, monthH / 20),
                  color: isCurrentMonth ? "var(--color-primary)" : "var(--color-ink)",
                }}
              >
                {name}
              </div>
              <div className="flex flex-col flex-1 min-h-0">
                <div
                  className="grid flex-1 min-h-0 gap-x-1 content-start"
                style={{
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr)) minmax(36px, auto)",
                  gridTemplateRows: "auto",
                  gridAutoRows: "40px",
                }}
              >
                  {WOCHENTAGE_KURZ.map((d) => (
                    <div
                      key={d}
                      className="text-center font-medium text-neutral-40 py-1.5"
                      style={{ fontSize: Math.max(11, monthH / 30) }}
                    >
                      {d}
                    </div>
                  ))}
                  <div
                    className="text-center font-medium text-neutral-40 py-1.5 pl-2 border-l-2 border-neutral-80"
                    style={{ fontSize: Math.max(11, monthH / 30) }}
                  >
                    KW
                  </div>
                  {weeks.flatMap((week, wi) => {
                    const mondayStr = getMondayOfWeek(week[0].dateStr);
                    const kw = getISOWeekNumber(mondayStr);
                    const weekTotal = week.reduce(
                      (acc, c) => acc + hoursForDay(entriesByDay[c.dateStr] ?? []),
                      0
                    );
                    const isZebra = wi % 2 === 1;
                    return [
                      ...week.map((cell) => (
                        <DayCell
                          key={cell.dateStr}
                          cell={cell}
                          month={month}
                          todayDateStr={todayDateStr}
                          entries={entriesByDay[cell.dateStr] ?? []}
                          baseFontSize={Math.max(12, monthH / 30)}
                          hasSearchMatch={
                            searchTerms.length > 0 &&
                            (entriesByDay[cell.dateStr] ?? []).some((e) => entryMatchesSearch(e, searchTerms))
                          }
                          onDayClick={onDayClick}
                          isZebra={isZebra}
                        />
                      )),
                      <WeekCell
                        key={`kw-${wi}`}
                        kw={kw}
                        weekTotal={weekTotal}
                        baseFontSize={Math.max(12, monthH / 30)}
                        fontSize={Math.max(12, monthH / 28)}
                        onWeekClick={onWeekClick ? () => onWeekClick(mondayStr) : undefined}
                        isZebra={isZebra}
                      />,
                    ];
                  })}
                </div>
                <div
                  className="shrink-0 h-8 pt-2 mt-2 border-t border-neutral-90 flex items-center justify-start font-semibold text-ink"
                  style={{ fontSize: Math.max(12, monthH / 28) }}
                >
                  {totalHours > 0 ? `${formatHoursDecimal(totalHours)}h` : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekCell({
  kw,
  weekTotal,
  baseFontSize,
  fontSize,
  onWeekClick,
  isZebra = false,
}: {
  kw: number;
  weekTotal: number;
  baseFontSize: number;
  fontSize: number;
  onWeekClick?: () => void;
  isZebra?: boolean;
}) {
  const content = (
    <div className="flex flex-col items-center justify-start gap-0.5 text-center">
      <span
        className="font-semibold tabular-nums leading-tight"
        style={{
          fontSize: Math.max(10, baseFontSize),
          color: "var(--color-neutral-40)",
        }}
      >
        {kw}
      </span>
      {weekTotal > 0 && (
        <span
          className="font-medium tabular-nums leading-tight"
          style={{
            fontSize,
            color: "var(--color-neutral-50)",
          }}
        >
          {formatHoursDecimal(weekTotal)}h
        </span>
      )}
    </div>
  );

  const className = `flex flex-col items-center justify-start px-1 py-1.5 pl-2 min-w-0 overflow-hidden h-full border-l-2 border-neutral-80 ${isZebra ? "bg-neutral-97" : ""}`;
  const style = {};

  if (onWeekClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onWeekClick();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onWeekClick();
          }
        }}
        className={`${className} hover:bg-primary/10 transition-colors cursor-pointer`}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}

function DayCell({
  cell,
  month,
  todayDateStr,
  entries,
  baseFontSize,
  hasSearchMatch = false,
  onDayClick,
  isZebra = false,
}: {
  cell: CalendarDay;
  month: number;
  todayDateStr: string;
  entries: Entry[];
  baseFontSize: number;
  hasSearchMatch?: boolean;
  onDayClick?: (dateStr: string) => void;
  isZebra?: boolean;
}) {
  const inMonth = cell.month === month;
  const isToday = cell.dateStr === todayDateStr;
  const hours = hoursForDay(entries);

  const content = (
    <>
      <span
        className="shrink-0 w-full text-center font-semibold leading-tight"
        style={{ fontSize: baseFontSize }}
      >
        {cell.day}
      </span>
      {hours > 0 && (
        <span
          className="shrink-0 w-full text-center font-medium leading-tight tabular-nums"
          style={{
            fontSize: Math.max(12, baseFontSize * 0.95),
            color: "var(--color-neutral-50)",
          }}
        >
          {formatHoursDecimal(hours)}h
        </span>
      )}
    </>
  );

  const className = `flex flex-col items-center justify-start gap-0.5 px-1 py-1.5 min-w-0 overflow-hidden h-full ${onDayClick && inMonth ? "pb-2" : "pb-1"} ${isZebra ? "bg-neutral-97" : ""} ${hasSearchMatch ? "ring-2 ring-primary ring-offset-0.5 bg-primary/10" : ""} ${inMonth ? (isToday ? "text-primary font-semibold bg-primary/10" : "text-ink font-medium") : "text-neutral-50 font-medium"}`;
  const style = { fontSize: baseFontSize };

  if (onDayClick && inMonth) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onDayClick(cell.dateStr);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onDayClick(cell.dateStr);
          }
        }}
        className={`${className} hover:bg-primary/10 transition-colors cursor-pointer`}
        style={style}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

