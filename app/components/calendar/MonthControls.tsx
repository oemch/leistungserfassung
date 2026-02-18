import { ChevronLeft, ChevronRight } from "lucide-react";
import { VIEWS } from "@/lib/constants";
import type { ViewMode } from "@/lib/types";

interface MonthControlsProps {
  periodLabel: string;
  periodTotal: string;
  viewMode: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onGoToToday?: () => void;
}

export function MonthControls({
  periodLabel,
  periodTotal,
  viewMode,
  onViewChange,
  onPrev,
  onNext,
  onGoToToday,
}: MonthControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-10 min-w-0">
      <h2 className="shrink-0 text-ink text-[22px] font-normal">
        {periodLabel}
      </h2>
      <div className="flex items-center gap-4 shrink-0">
          <span className="whitespace-nowrap font-medium text-ink text-[22px]">
            {periodTotal}
          </span>
          <div className="flex items-center gap-1 h-9">
          <button
            type="button"
            onClick={onPrev}
            className="h-full flex items-center justify-center px-2.5 hover:opacity-80 bg-white rounded-lg border-[1.5px] border-neutral-70"
            aria-label={
              viewMode === "Tag"
                ? "Vorheriger Tag"
                : viewMode === "Woche"
                  ? "Vorherige Woche"
                  : viewMode === "Jahr"
                    ? "Vorheriges Jahr"
                    : viewMode === "Liste"
                      ? "Vorheriger Monat"
                      : "Vorheriger Monat"
            }
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          {(viewMode === "Tag" || viewMode === "Woche" || viewMode === "Monat" || viewMode === "Jahr" || viewMode === "Liste") &&
          onGoToToday ? (
            <button
              type="button"
              onClick={onGoToToday}
              className="h-full min-w-[140px] flex items-center justify-center px-3 text-center text-sm font-medium bg-white hover:bg-neutral-97 cursor-pointer rounded-lg border-[1.5px] border-neutral-70"
              title="Zu heute springen (T)"
            >
              {periodLabel}
            </button>
          ) : (
            <span
              className="h-full min-w-[140px] flex items-center justify-center px-3 text-center text-sm font-medium bg-white rounded-lg border-[1.5px] border-neutral-70"
            >
              {periodLabel}
            </span>
          )}
          <button
            type="button"
            onClick={onNext}
            className="h-full flex items-center justify-center px-2.5 hover:opacity-80 bg-white rounded-lg border-[1.5px] border-neutral-70"
            aria-label={
              viewMode === "Tag"
                ? "Nächster Tag"
                : viewMode === "Woche"
                  ? "Nächste Woche"
                  : viewMode === "Jahr"
                    ? "Nächstes Jahr"
                    : viewMode === "Liste"
                      ? "Nächster Monat"
                      : "Nächster Monat"
            }
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
        <div
          className="inline-flex h-9 rounded-lg overflow-hidden border-[1.5px] border-neutral-70 shrink-0"
          role="group"
          aria-label="Ansicht wählen"
        >
          {VIEWS.map((v, i) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              className={`h-full w-[75px] text-sm font-medium hover:opacity-90 border-r border-neutral-70 last:border-r-0 ${v === viewMode ? "bg-primary text-white" : "bg-white text-ink"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
