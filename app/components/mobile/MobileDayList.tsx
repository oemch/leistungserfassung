"use client";

import type { Entry } from "@/lib/types";
import { formatHoursDecimal } from "@/lib/timeUtils";
import { effectiveHoursForDisplay } from "@/lib/timeUtils";

interface MobileDayListProps {
  entries: Entry[];
  dateLabel: string;
  onEntryClick?: (entry: Entry) => void;
}

export function MobileDayList({ entries, dateLabel, onEntryClick }: MobileDayListProps) {
  const sorted = [...entries].sort((a, b) => {
    const sa = a.startTime ?? "";
    const sb = b.startTime ?? "";
    return sa.localeCompare(sb);
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <h2 className="text-base font-medium text-neutral-50 mb-3">{dateLabel}</h2>
      {sorted.length === 0 ? (
        <p className="text-base text-neutral-50">Keine Einträge für heute.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((entry) => {
            const hours = entry.startTime && entry.endTime
              ? effectiveHoursForDisplay(entry.startTime, entry.endTime, entry.text)
              : 0;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onEntryClick?.(entry)}
                  className="w-full text-left rounded-lg border border-neutral-85 bg-white px-4 py-3 flex flex-col gap-1"
                >
                  <span
                    className="text-base font-medium truncate"
                    style={{ color: entry.fg }}
                  >
                    {entry.text}
                  </span>
                  <span className="text-sm text-neutral-50">
                    {entry.startTime && entry.endTime
                      ? `${entry.startTime} – ${entry.endTime}`
                      : "—"}
                    {" · "}
                    {formatHoursDecimal(hours)} h
                  </span>
                  {entry.comment && (
                    <span className="text-sm text-neutral-50 truncate">
                      {entry.comment}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
