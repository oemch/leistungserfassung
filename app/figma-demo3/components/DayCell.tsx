import { TaskChip } from "./TaskChip";

export type TaskEntry = { label: string; colorClass: string };

interface DayCellProps {
  day: number;
  month: number;
  hours: string;
  isToday: boolean;
  isWeekend: boolean;
  entries: TaskEntry[];
}

export function DayCell({ day, month, hours, isToday, isWeekend, entries }: DayCellProps) {
  const isFrei = isWeekend && entries.length === 0;
  const isEmpty = entries.length === 0 && !isFrei;

  return (
    <div
      className={`rounded-lg border p-3 min-h-[120px] flex flex-col min-w-0 ${
        isToday ? "border-[var(--figma-primary)] bg-[color-mix(in_srgb,var(--figma-primary)_8%,white)]" : "border-[var(--figma-neutral-85)] bg-[var(--figma-bw-white)]"
      }`}
    >
      <div className="flex justify-between text-sm font-medium mb-2" style={{ color: "var(--figma-neutral-40)" }}>
        <span>{hours}</span>
        <span>{day}.{month}.</span>
      </div>
      <div className="flex flex-col gap-1 overflow-hidden" style={{ gap: "var(--figma-8)" }}>
        {isFrei && <span className="text-sm" style={{ color: "var(--figma-neutral-70)" }}>Frei</span>}
        {isEmpty && isToday && (
          <span className="text-sm italic" style={{ color: "var(--figma-neutral-70)" }}>
            Es sind noch keine Einträge vorhanden.
          </span>
        )}
        {entries.length > 0 && entries.map((e, i) => (
          <TaskChip key={i} label={e.label} className={e.colorClass} />
        ))}
      </div>
    </div>
  );
}
