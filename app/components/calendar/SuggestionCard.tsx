"use client";

import { Calendar, UserPlus, X, Check } from "lucide-react";
import type { Suggestion } from "@/lib/suggestions";
import { formatDateShort, getTodayDateStr } from "@/lib/timeUtils";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function SuggestionCard({ suggestion, onAccept, onReject }: SuggestionCardProps) {
  const durationStr =
    suggestion.durationHours >= 1
      ? `${Math.round(suggestion.durationHours)} Std`
      : `${Math.round(suggestion.durationHours * 60)} Min`;
  const timeRange =
    suggestion.startTime && suggestion.endTime
      ? `${suggestion.startTime} – ${suggestion.endTime} Uhr`
      : null;
  const rawDateStr = suggestion.dateStr;
  const dateDisplay =
    rawDateStr
      ? rawDateStr === getTodayDateStr()
        ? "Heute"
        : formatDateShort(rawDateStr)
      : null;

  return (
    <div
      className="flex rounded-lg border bg-white shadow-sm overflow-hidden min-w-0"
      style={{
        borderColor: suggestion.accentColor,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="w-1.5 shrink-0"
        style={{ backgroundColor: suggestion.accentColor }}
        aria-hidden
      />
      <div className="flex-1 flex items-center gap-3 py-2.5 px-3 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink truncate">{suggestion.projectLabel}</div>
          {suggestion.description ? (
            <div className="text-sm truncate text-neutral-40">{suggestion.description}</div>
          ) : null}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-neutral-40">
              <span className="inline-flex shrink-0 -translate-y-px">
                {suggestion.sourceType === "calendar" ? (
                  <Calendar size={14} aria-hidden />
                ) : (
                  <UserPlus size={14} aria-hidden />
                )}
              </span>
              {suggestion.sourceType === "calendar"
                ? "Vorschlag Kalender"
                : `Vorschlag ${suggestion.sourceUserName}`}
            </span>
            {dateDisplay ? (
              <span className="text-xs text-neutral-40">{dateDisplay}</span>
            ) : null}
            <span className="text-xs text-neutral-40">{durationStr}</span>
            {timeRange ? (
              <span className="text-xs text-neutral-40">{timeRange}</span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onReject(suggestion.id)}
            className="w-8 h-8 rounded flex items-center justify-center bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            aria-label="Ablehnen"
          >
            <X size={16} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onAccept(suggestion.id)}
            className="w-8 h-8 rounded flex items-center justify-center bg-green-50 text-green-800 hover:bg-green-100 transition-colors"
            aria-label="Annehmen"
          >
            <Check size={16} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
