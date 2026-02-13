import { Fragment } from "react";
import { DayCell } from "./DayCell";
import type { TaskEntry } from "./DayCell";

const WOCHENTAGE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

export type DayData = {
  day: number;
  month: number;
  hours: string;
  isToday: boolean;
  isWeekend: boolean;
  entries: TaskEntry[];
};

interface CalendarGridProps {
  weeks: DayData[][];
  weekTotals: string[];
}

export function CalendarGrid({ weeks, weekTotals }: CalendarGridProps) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(7, minmax(140px, 1fr)) 80px" }}>
      {WOCHENTAGE.map((d) => (
        <div key={d} className="text-center text-sm font-semibold py-1 whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: "var(--figma-neutral-70)" }}>
          {d}
        </div>
      ))}
      <div aria-hidden />
      {weeks.map((week, wi) => (
        <Fragment key={wi}>
          {week.map((cell) => (
            <DayCell
              key={`${cell.day}-${cell.month}`}
              day={cell.day}
              month={cell.month}
              hours={cell.hours}
              isToday={cell.isToday}
              isWeekend={cell.isWeekend}
              entries={cell.entries}
            />
          ))}
          <div className="flex items-center justify-center text-sm font-semibold" style={{ color: "var(--figma-neutral-40)" }}>
            {weekTotals[wi]}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
