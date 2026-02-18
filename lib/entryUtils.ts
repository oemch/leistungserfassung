import type { Entry } from "./types";
import { getChipStyleForLabel } from "./constants";

export type DbRow = {
  id: string;
  start_time: string;
  end_time: string;
  label: string;
  comment: string;
  is_billable: boolean;
};

export function entryFromRow(
  row: DbRow,
  labelToStyle: Map<string, { bg: string; fg: string }>
): Entry {
  const style = labelToStyle.get(row.label) ?? getChipStyleForLabel(row.label);
  return {
    id: row.id,
    text: row.label,
    ...style,
    startTime: row.start_time,
    endTime: row.end_time,
    comment: row.comment,
    isBillable: row.is_billable,
  };
}

/** Normalisiert für Suche: Kleinbuchstaben, Leerzeichen und Bindestriche entfernen. "inc 2345" ↔ "INC-2345" */
export function normalizeForSearch(s: string): string {
  return s.toLowerCase().replace(/[\s\-]/g, "");
}

export function entryMatchesSearch(entry: Entry, searchTerms: string[]): boolean {
  const terms = searchTerms.map((t) => t.trim()).filter(Boolean);
  if (terms.length === 0) return false;
  const text = (entry.text ?? "") + " " + (entry.comment ?? "");
  const normText = normalizeForSearch(text);
  return terms.some((q) => normText.includes(normalizeForSearch(q)));
}

const HIGHLIGHT_CLASS = "ring-2 ring-primary ring-offset-1 z-20";

export function entryHighlightClass(entry: Entry, searchTerms: string[]): string | undefined {
  return entryMatchesSearch(entry, searchTerms) ? HIGHLIGHT_CLASS : undefined;
}
