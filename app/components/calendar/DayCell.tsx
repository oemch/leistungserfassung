import type { Entry } from "@/lib/types";
import { TaskChip } from "./TaskChip";

interface DayCellProps {
  day: number;
  month: number;
  hours: string;
  isToday: boolean;
  isWeekend: boolean;
  entries: Entry[];
  /** Klick auf Eintrag (ohne Trash) – nur bei Einträgen mit id. */
  onEntryClick?: (entry: Entry) => void;
  /** Klick auf Trash – Eintrag löschen, nur bei Einträgen mit id. */
  onEntryDelete?: (entry: Entry) => void;
}

export function DayCell({ day, month, hours, isToday, isWeekend, entries, onEntryClick, onEntryDelete }: DayCellProps) {
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
            e.id && (onEntryClick || onEntryDelete) ? (
              <div
                key={e.id}
                className="group relative w-full rounded min-w-0 text-xs overflow-hidden"
                style={{ backgroundColor: e.bg, color: e.fg }}
              >
                <button
                  type="button"
                  onClick={() => onEntryClick?.(e)}
                  className="text-left w-full px-2 py-0.5 pr-7 rounded hover:opacity-90 transition-opacity"
                  style={{ color: e.fg }}
                >
                  {(e.startTime != null || e.endTime != null) && (
                    <span className="block truncate" style={{ lineHeight: 1.2 }}>
                      {e.startTime ?? "–"} – {e.endTime ?? "–"}
                    </span>
                  )}
                  <span className={`block truncate ${e.startTime != null || e.endTime != null ? "mt-0.5" : ""}`} style={{ lineHeight: 1.2 }}>
                    {e.text}
                  </span>
                </button>
                {onEntryDelete && (
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEntryDelete(e);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
                    style={{ color: e.fg }}
                    aria-label="Eintrag löschen"
                  >
                    <span className="material-icons" style={{ fontSize: 16 }} aria-hidden>delete</span>
                  </button>
                )}
              </div>
            ) : (
              <TaskChip key={i} text={e.text} bg={e.bg} fg={e.fg} startTime={e.startTime} endTime={e.endTime} />
            )
          )
        )}
      </div>
    </div>
  );
}
