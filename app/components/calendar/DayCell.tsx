import type { Entry } from "@/lib/types";
import { TaskChip } from "./TaskChip";

interface DayCellProps {
  day: number;
  month: number;
  hours: string;
  isToday: boolean;
  isWeekend: boolean;
  entries: Entry[];
  /** Nur bei Einträgen mit id aufgerufen (gespeicherte Einträge), nicht bei Live. */
  onEntryClick?: (entry: Entry) => void;
}

export function DayCell({ day, month, hours, isToday, isWeekend, entries, onEntryClick }: DayCellProps) {
  const isFrei = isWeekend && entries.length === 0;

  return (
    <div
      className={`rounded-lg border p-3 w-full min-w-0 h-[336px] flex flex-col box-border ${
        isToday
          ? "border-[var(--figma-primary)] bg-[#F5FAF9]"
          : "border-[var(--figma-neutral-85)] bg-[var(--figma-bw-white)]"
      }`}
    >
      <div className="flex justify-between text-sm font-medium mb-2" style={{ color: "var(--figma-neutral-40)" }}>
        <span>{hours}</span>
        <span>{day}.{month}.</span>
      </div>
      <div className="flex flex-col gap-1 overflow-hidden">
        {isFrei ? (
          <span className="text-sm" style={{ color: "var(--figma-neutral-70)" }}>Frei</span>
        ) : entries.length === 0 ? (
          isToday ? (
            <span
              style={{
                color: "var(--BW-Black, #100C08)",
                fontFamily: "var(--font-coop), Coop, sans-serif",
                fontSize: 14,
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "140%",
              }}
            >
              Es sind noch keine Einträge vorhanden.
            </span>
          ) : null
        ) : (
          entries.map((e, i) =>
            e.id && onEntryClick ? (
              <button
                key={e.id}
                type="button"
                onClick={() => onEntryClick(e)}
                className="text-left w-full rounded hover:opacity-90 transition-opacity"
              >
                <TaskChip text={e.text} bg={e.bg} fg={e.fg} startTime={e.startTime} endTime={e.endTime} />
              </button>
            ) : (
              <TaskChip key={i} text={e.text} bg={e.bg} fg={e.fg} startTime={e.startTime} endTime={e.endTime} />
            )
          )
        )}
      </div>
    </div>
  );
}
