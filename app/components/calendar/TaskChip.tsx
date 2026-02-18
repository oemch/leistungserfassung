import type { Entry } from "@/lib/types";
import { EntryLabel } from "./EntryLabel";

interface TaskChipProps extends Pick<Entry, "text" | "bg" | "fg"> {
  startTime?: string;
  endTime?: string;
  className?: string;
}

export function TaskChip({ text, bg, fg, startTime, endTime, className }: TaskChipProps) {
  const hasTime = startTime != null || endTime != null;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded block overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: bg, color: fg }}
      title={text}
    >
      {hasTime && (
        <span className="block truncate" style={{ lineHeight: 1.2 }}>
          {startTime ?? "–"} – {endTime ?? "–"}
        </span>
      )}
      <EntryLabel text={text} fg={fg} className={`block truncate ${hasTime ? "mt-0.5" : ""}`} style={{ lineHeight: 1.2 }} />
    </span>
  );
}
