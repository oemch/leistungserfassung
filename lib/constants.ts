import type { FavoriteItem, ViewMode } from "./types";

export const VIEWS: readonly ViewMode[] = ["Tag", "Woche", "Monat", "Jahr"];

export const WOCHENTAGE = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
] as const;

export const FAVORITEN: FavoriteItem[] = [
  { label: "Projekt A", bg: "#FFF5D6", fg: "#92400e" },
  { label: "Projekt B", bg: "#E6DEF3", fg: "#5b21b6" },
  { label: "Projekt C", bg: "#D5EEEB", fg: "#0f766e" },
  { label: "T-0000 Beschreibung", bg: "#FDE7E6", fg: "#b91c1c" },
  { label: "T-99999 Beschreibungstext", bg: "#E1F2E2", fg: "#166534" },
];

export const PROJECT_OPTIONS = [
  "Projekt A",
  "Projekt B",
  "Projekt C",
  "Projekt D",
  "Interne Schulung (IS)",
  "Administration",
] as const;

export const TICKET_OPTIONS = [
  "Feature 1234",
  "Feature 8392",
  "Ticket 2445",
  "Ticket 6372",
] as const;

/** Schriftfarbe für alle Chips (Kacheln, Favoriten). */
export const CHIP_FG = "#00271D";

/** Chip-Hintergrundfarben pro Projekt/Ticket – wie Demo-Kacheln 16.–20.2. und Favoriten. */
const CHIP_BG: Record<string, string> = {
  "Projekt A": "#FFF5D6",
  "Projekt B": "#E6DEF3",
  "Projekt C": "#D5EEEB",
  "Projekt D": "var(--figma-neutral-90)",
  "Interne Schulung (IS)": "var(--figma-neutral-90)",
  Administration: "var(--figma-neutral-90)",
  "Feature 1234": "#D5EEEB",
  "Feature 8392": "#E6DEF3",
  "Ticket 2445": "#D5EEEB",
  "Ticket 6372": "#D5EEEB",
};

/** Liefert bg/fg für einen gespeicherten Eintrag anhand des Labels (Projekt/Ticket). */
export function getChipStyleForLabel(label: string): { bg: string; fg: string } {
  const bg = CHIP_BG[label] ?? "var(--figma-neutral-90)";
  return { bg, fg: CHIP_FG };
}
