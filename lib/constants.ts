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
