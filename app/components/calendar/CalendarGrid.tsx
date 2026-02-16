import type { Entry } from "@/lib/types";
import { WOCHENTAGE } from "@/lib/constants";
import { DayCell } from "./DayCell";

interface CalendarGridProps {
  daysWeek1: number[];
  daysWeek2: number[];
  month: number;
  isTodayDay: number;
  isWeekend: (day: number) => boolean;
  getHours: (day: number) => string;
  entriesByDay: Record<string, Entry[]>;
  weekTotals: [string, string];
  onEntryClick?: (entry: Entry) => void;
  onEntryDelete?: (entry: Entry) => void;
}

export function CalendarGrid({
  daysWeek1,
  daysWeek2,
  month,
  isTodayDay,
  isWeekend,
  getHours,
  entriesByDay,
  weekTotals,
  onEntryClick,
  onEntryDelete,
}: CalendarGridProps) {
  return (
    <div className="w-full max-w-[1854px] mx-auto overflow-x-auto min-w-0">
      <div
        className="grid gap-3 min-w-0"
        style={{
          gridTemplateColumns: "repeat(7, minmax(180px, 246px)) 72px",
          width: "100%",
          minWidth: "1404px",
        }}
      >
        {WOCHENTAGE.map((d) => (
          <div
            key={d}
            className="text-center py-1 whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
            style={{
              color: "var(--neutrals-32-grey-1, #55514D)",
              fontFamily: "Inter, sans-serif",
              fontSize: 20,
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "20px",
            }}
          >
            {d}
          </div>
        ))}
        <div />
        {daysWeek1.map((day) => (
          <DayCell
            key={day}
            day={day}
            month={month}
            isToday={day === isTodayDay}
            isWeekend={isWeekend(day)}
            entries={entriesByDay[String(day)] ?? []}
            hours={getHours(day)}
            onEntryClick={onEntryClick}
            onEntryDelete={onEntryDelete}
          />
        ))}
        <div className="flex items-center justify-center text-sm font-medium" style={{ color: "var(--figma-neutral-40)" }}>
          {weekTotals[0]}
        </div>
        {daysWeek2.map((day) => (
          <DayCell
            key={day}
            day={day}
            month={month}
            isToday={day === isTodayDay}
            isWeekend={isWeekend(day)}
            entries={entriesByDay[String(day)] ?? []}
            hours={getHours(day)}
            onEntryClick={onEntryClick}
            onEntryDelete={onEntryDelete}
          />
        ))}
        <div className="flex items-center justify-center text-sm font-medium" style={{ color: "var(--figma-neutral-40)" }}>
          {weekTotals[1]}
        </div>
      </div>
    </div>
  );
}
