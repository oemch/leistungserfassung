import type { ViewMode } from "./types";
import { getMondayOfWeek } from "./timeUtils";

export const STORAGE_VIEW = "leistungserfassung-view";
export const STORAGE_WEEK_START = "leistungserfassung-week-start";
export const STORAGE_MONTH = "leistungserfassung-month";
export const STORAGE_DAY = "leistungserfassung-day";

export interface ViewState {
  view: ViewMode;
  weekStart: string;
  year: number;
  monthNum: number;
  day: string;
}

export function loadViewState(todayDateStr: string): ViewState | null {
  if (typeof window === "undefined") return null;
  const view = window.localStorage.getItem(STORAGE_VIEW) as ViewMode | null;
  const validViews: ViewMode[] = ["Tag", "Woche", "Monat", "Jahr", "Liste"];
  if (!view || !validViews.includes(view)) return null;
  const weekStart = window.localStorage.getItem(STORAGE_WEEK_START);
  const month = window.localStorage.getItem(STORAGE_MONTH);
  const day = window.localStorage.getItem(STORAGE_DAY);
  let year: number;
  let monthNum: number;
  const [ty, tm] = todayDateStr.split("-").map(Number);
  if (month && /^\d{4}-\d{1,2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    year = y ?? ty ?? new Date().getFullYear();
    monthNum = m ?? tm ?? new Date().getMonth() + 1;
  } else {
    year = ty ?? new Date().getFullYear();
    monthNum = tm ?? new Date().getMonth() + 1;
  }
  const monday = getMondayOfWeek(todayDateStr);
  const weekStartValid = weekStart && /^\d{4}-\d{2}-\d{2}$/.test(weekStart);
  const dayValid = day && /^\d{4}-\d{2}-\d{2}$/.test(day);
  return {
    view,
    weekStart: weekStartValid ? weekStart! : monday,
    year,
    monthNum,
    day: view === "Tag" && dayValid ? day! : todayDateStr,
  };
}
