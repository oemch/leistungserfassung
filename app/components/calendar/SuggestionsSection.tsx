"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Suggestion } from "@/lib/suggestions";
import { SuggestionCard } from "./SuggestionCard";

const VISIBLE_MAX = 2;

interface SuggestionsSectionProps {
  suggestions: Suggestion[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function SuggestionsSection({
  suggestions,
  onAccept,
  onReject,
}: SuggestionsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  if (suggestions.length === 0) return null;

  const visible = expanded ? suggestions : suggestions.slice(0, VISIBLE_MAX);
  const hasMore = suggestions.length > VISIBLE_MAX;

  return (
    <div className="mb-4">
      <span className="text-base font-semibold text-ink block mb-2">Vorschläge</span>
      <div className="flex flex-col gap-2">
        {visible.map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            onAccept={onAccept}
            onReject={onReject}
          />
        ))}
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center justify-center gap-1 py-2 text-sm font-medium text-primary hover:text-primary/90 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp size={16} aria-hidden />
                Weniger anzeigen
              </>
            ) : (
              <>
                <ChevronDown size={16} aria-hidden />
                {(() => {
                  const n = suggestions.length - VISIBLE_MAX;
                  return n === 1
                    ? "1 weiteren Vorschlag anzeigen"
                    : `${n} weitere Vorschläge anzeigen`;
                })()}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
