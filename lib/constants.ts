import type { FavoriteItem, ViewMode } from "./types";

export const DEFAULT_USER_SLUG = "sara_meier";

export const VIEWS: readonly ViewMode[] = ["Tag", "Woche", "Monat", "Jahr", "Liste"];

export const TARGET_HOURS_PER_WEEK = 40;

const TARGET_HOURS_BY_USER: Record<string, number> = {
  sara_meier: 32,
  marco_keller: 40,
};

export function getTargetHoursPerWeek(userSlug: string): number {
  return TARGET_HOURS_BY_USER[userSlug] ?? TARGET_HOURS_PER_WEEK;
}

/** Soll-Stunden pro Arbeitstag. Bei 80% (32h) ist ein Tag frei → 32/4 = 8h. Bei 100% (40h) → 40/5 = 8h. */
export function getSollPerDay(targetHoursPerWeek: number): number {
  if (targetHoursPerWeek <= 32) return targetHoursPerWeek / 4; // 80%: 4 Arbeitstage
  return targetHoursPerWeek / 5;
}

export const WOCHENTAGE = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
] as const;

export const WOCHENTAGE_KURZ = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

export const FAVORITEN: FavoriteItem[] = [
  { label: "Migros Bank | Banking Platform | PROJ-2847", bg: "#FFF5D6", fg: "#00271D" },
  { label: "Clientis | Cyber Security | PROJ-4521", bg: "#E6DEF3", fg: "#00271D" },
  { label: "St.Galler KB | Banking Platform | PROJ-6122", bg: "#D5EEEB", fg: "#00271D" },
  { label: "Meeting intern", bg: "#EFEEED", fg: "#00271D" },
  { label: "Administration", bg: "#EFEEED", fg: "#00271D" },
  { label: "Interne Schulung (IS)", bg: "#EFEEED", fg: "#00271D" },
  { label: "Ferien", bg: "#EFEEED", fg: "#00271D" },
];

export const LEISTUNG_OPTIONS = [
  "Ferien",
  "Krankheit",
  "Heirat in der Familie oder Verwandtschaft",
  "Meeting intern",
  "Pikettbereitschaft",
  "Piketteinsatz",
] as const;

export const PROJECT_OPTIONS = LEISTUNG_OPTIONS;

export const TICKET_OPTIONS = [
  "INC-4521",
  "CHG-892",
  "INC-4522",
  "CHG-893",
  "INC-4527",
  "CHG-895",
] as const;

export const CHIP_FG = "#00271D";

const CHIP_BG: Record<string, string> = {
  Ferien: "#EFEEED",
  Krankheit: "#EFEEED",
  "Heirat in der Familie oder Verwandtschaft": "#EFEEED",
  "Meeting intern": "#EFEEED",
  Pikettbereitschaft: "#EFEEED",
  Piketteinsatz: "#EFEEED",
  "Interne Schulung (IS)": "#EFEEED",
  Administration: "#EFEEED",
  "Frei (80%)": "#EFEEED",
  "Migros Bank | Banking Platform | PROJ-2847": "#FFF5D6",
  "Clientis | Cyber Security | PROJ-4521": "#E6DEF3",
  "St.Galler KB | Banking Platform | PROJ-6122": "#D5EEEB",
  "Nidwaldner KB | ix.Cloud | PROJ-2211": "#E2F0E2",
  "Lernende betreuen": "#FFF5D6",
  "Weekly im Team": "#EFEEED",
  "INC-4521": "#D5EEEB",
  "CHG-892": "#E6DEF3",
  "INC-4522": "#D5EEEB",
  "CHG-893": "#E6DEF3",
  "INC-4527": "#D5EEEB",
  "CHG-895": "#E6DEF3",
};

export function sortOptionsByRecent(options: readonly string[], recentLabels: string[]): string[] {
  const set = new Set(options);
  const result: string[] = [];
  for (const label of recentLabels) {
    if (set.has(label)) result.push(label);
  }
  for (const opt of options) {
    if (!result.includes(opt)) result.push(opt);
  }
  return result;
}

export function getChipStyleForLabel(label: string): { bg: string; fg: string } {
  const exact = CHIP_BG[label];
  if (exact) return { bg: exact, fg: CHIP_FG };
  return { bg: "#EFEEED", fg: CHIP_FG };
}
