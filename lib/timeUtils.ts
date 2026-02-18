export function formatHoursDecimal(hours: number, decimals = 1): string {
  return hours.toFixed(decimals).replace(".", ",");
}

export function durationFromTimes(start: string, end: string): string {
  if (!start || !end) return "0,00";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startM = (sh ?? 0) * 60 + (sm ?? 0);
  const endM = (eh ?? 0) * 60 + (em ?? 0);
  let diffM = endM - startM;
  if (diffM < 0) diffM = 0;
  return formatHoursDecimal(diffM / 60, 2);
}

export function parseDurationHours(s: string): number | null {
  const normalized = s.trim().replace(",", ".");
  const n = parseFloat(normalized);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

export function durationHours(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startM = (sh ?? 0) * 60 + (sm ?? 0);
  const endM = (eh ?? 0) * 60 + (em ?? 0);
  let diffM = endM - startM;
  if (diffM < 0) diffM = 0;
  return diffM / 60;
}

const LUNCH_START_M = 12 * 60;
const LUNCH_END_M = 13 * 60;
const LUNCH_HOURS = 1;

export function effectiveHoursForDisplay(
  start: string,
  end: string,
  label: string
): number {
  const raw = durationHours(start, end);
  if (raw === 0) return 0;
  if (label === "Frei (80%)") return 0;
  if (label !== "Ferien") return raw;
  const startM = minutesFromMidnight(start);
  const endM = minutesFromMidnight(end);
  const overlapStart = Math.max(startM, LUNCH_START_M);
  const overlapEnd = Math.min(endM, LUNCH_END_M);
  const lunchOverlapM = Math.max(0, overlapEnd - overlapStart);
  const deductH = Math.min(LUNCH_HOURS, lunchOverlapM / 60);
  return Math.max(0, raw - deductH);
}

export function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getTodayDateStr(): string {
  return dateToStr(new Date());
}

export function formatDateShort(dateStr: string, withHeute = false): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const today = getTodayDateStr();
  const prefix = withHeute && dateStr === today ? "Heute, " : "";
  return `${prefix}${d}.${m}.${y}`;
}

export function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

export function formatDateLong(dateStr: string): string {
  const date = parseDateLocal(dateStr);
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const dayName = weekdays[date.getDay()];
  return `${dayName}, ${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

export function isWeekend(dateStr: string): boolean {
  const date = parseDateLocal(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
}

export interface CalendarDay {
  dateStr: string;
  day: number;
  month: number;
}

function isBeforeMonth(dateStr: string, year: number, month: number): boolean {
  const [y, m] = dateStr.split("-").map(Number);
  return y! < year || (y === year && m! < month);
}

function isAfterMonth(dateStr: string, year: number, month: number): boolean {
  const [y, m] = dateStr.split("-").map(Number);
  return y! > year || (y === year && m! > month);
}

export function getCalendarDaysForMonth(year: number, month: number): { weeks: CalendarDay[][] } {
  const first = new Date(year, month - 1, 1);
  const dayOfWeek = first.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = new Date(first);
  start.setDate(first.getDate() + mondayOffset);
  const allWeeks: CalendarDay[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + w * 7 + i);
      week.push({
        dateStr: dateToStr(d),
        day: d.getDate(),
        month: d.getMonth() + 1,
      });
    }
    allWeeks.push(week);
  }
  const weeks = allWeeks.filter((week) => {
    const allPrev = week.every((c) => isBeforeMonth(c.dateStr, year, month));
    const allNext = week.every((c) => isAfterMonth(c.dateStr, year, month));
    return !allPrev && !allNext;
  });
  return { weeks };
}

export function getCalendarDays(): { week1: CalendarDay[]; week2: CalendarDay[] } {
  const today = new Date();
  const { weeks } = getCalendarDaysForMonth(today.getFullYear(), today.getMonth() + 1);
  const todayStr = getTodayDateStr();
  const idx = weeks.findIndex((w) => w.some((c) => c.dateStr === todayStr));
  if (idx >= 0 && idx < weeks.length - 1) {
    return { week1: weeks[idx], week2: weeks[idx + 1] };
  }
  const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const week1: CalendarDay[] = [];
  const week2: CalendarDay[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const cell = { dateStr: dateToStr(d), day: d.getDate(), month: d.getMonth() + 1 };
    if (i < 7) week1.push(cell);
    else week2.push(cell);
  }
  return { week1, week2 };
}

export function getMonthLabel(year: number, month: number): string {
  const names = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  return `${names[month - 1]} ${year}`;
}

export function getYearLabel(year: number): string {
  return String(year);
}

export function getDateStrsForYear(year: number): string[] {
  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const daysInMonth = [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const result: string[] = [];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= daysInMonth[m - 1]; d++) {
      result.push(
        `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      );
    }
  }
  return result;
}

/** ISO-Kalenderwoche (KW) für ein Datum. */
export function getISOWeekNumber(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  const dayNum = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - dayNum);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7));
}

export function getMondayOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  const dayOfWeek = date.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setDate(date.getDate() + mondayOffset);
  return dateToStr(date);
}

export function getCalendarDayForDate(dateStr: string): CalendarDay {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { dateStr, day: d!, month: m! };
}

/** Liefert Datums-Strings für einen Bereich um ein Datum herum (z.B. für Mobile-Navigation). */
export function getDateStrsAround(centerStr: string, daysBefore: number, daysAfter: number): string[] {
  const [y, m, d] = centerStr.split("-").map(Number);
  const center = new Date(y!, m! - 1, d!);
  const result: string[] = [];
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d2 = new Date(center);
    d2.setDate(center.getDate() + i);
    result.push(dateToStr(d2));
  }
  return result;
}

export function getDayLabel(dateStr: string, todayStr?: string): string {
  if (todayStr && dateStr === todayStr) return formatDateShort(dateStr, true);
  return formatDateLong(dateStr);
}

export function getCalendarDaysForWeek(mondayStr: string): { weeks: CalendarDay[][] } {
  const [y, m, day] = mondayStr.split("-").map(Number);
  const monday = new Date(y!, m! - 1, day!);
  const week: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push({
      dateStr: dateToStr(d),
      day: d.getDate(),
      month: d.getMonth() + 1,
    });
  }
  return { weeks: [week] };
}

export function getWeekLabel(mondayStr: string): string {
  const [y, m, d] = mondayStr.split("-").map(Number);
  const monday = new Date(y!, m! - 1, d!);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const endM = sunday.getMonth();
  const endY = sunday.getFullYear();
  const end = `${sunday.getDate()}. ${monthNames[endM]} ${endY}`;
  const startM = monday.getMonth();
  const sameMonth = startM === endM && monday.getFullYear() === endY;
  const start = sameMonth ? `${monday.getDate()}.` : `${monday.getDate()}. ${monthNames[startM]}`;
  return `${start}–${end}`;
}

export function minutesFromMidnight(time: string): number {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function timeFromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function roundTo15Minutes(minutes: number, direction: "floor" | "ceil"): number {
  const slot = direction === "floor" ? Math.floor(minutes / 15) * 15 : Math.ceil(minutes / 15) * 15;
  return Math.max(0, Math.min(24 * 60 - 1, slot));
}

export function endTimeFromStartAndHours(start: string, hours: number): string {
  if (!start) return "";
  const [sh, sm] = start.split(":").map(Number);
  const startM = (sh ?? 0) * 60 + (sm ?? 0);
  const endM = startM + hours * 60;
  const endH = Math.floor(endM / 60) % 24;
  const endMin = Math.round(endM % 60);
  return `${String(endH).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
}

/** Assigns lane indices to overlapping time entries for display. */
export function assignLanes(entries: { startM: number; endM: number }[]): number[] {
  const lanes: number[] = [];
  const endByLane: number[] = [];
  for (const e of entries) {
    let lane = 0;
    while (lane < endByLane.length && endByLane[lane] > e.startM) lane++;
    endByLane[lane] = e.endM;
    lanes.push(lane);
  }
  return lanes;
}

/** Returns suggested start time based on last end time of entries. */
export function getSuggestedStartFromEntries(entries: Array<{ endTime?: string }>): string {
  const withEnd = entries.filter((e) => e.endTime).map((e) => e.endTime!);
  if (withEnd.length === 0) return "08:00";
  withEnd.sort((a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return (ah ?? 0) * 60 + (am ?? 0) - (bh ?? 0) * 60 - (bm ?? 0);
  });
  return withEnd[withEnd.length - 1] ?? "08:00";
}
