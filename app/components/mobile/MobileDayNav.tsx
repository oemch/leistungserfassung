"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface MobileDayNavProps {
  dateLabel: string;
  onPrev: () => void;
  onNext: () => void;
}

export function MobileDayNav({
  dateLabel,
  onPrev,
  onNext,
}: MobileDayNavProps) {
  return (
    <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-2 bg-white border-b border-neutral-85">
      <button
        type="button"
        onClick={onPrev}
        className="p-2 -ml-2 rounded-lg text-ink hover:bg-neutral-97"
        aria-label="Vorheriger Tag"
      >
        <ChevronLeft size={24} />
      </button>
      <div className="flex-1 flex items-center justify-center min-w-0">
        <span className="font-medium text-ink truncate">{dateLabel}</span>
      </div>
      <button
        type="button"
        onClick={onNext}
        className="p-2 -mr-2 rounded-lg text-ink hover:bg-neutral-97"
        aria-label="Nächster Tag"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
