import type { TaskEntry } from "../components/DayCell";
import type { DayData } from "../components/CalendarGrid";

const MONTH = 12;

const DEMO_ENTRIES: Record<number, TaskEntry[]> = {
  1: [
    { label: "A Code Review", colorClass: "bg-[var(--figma-amber-2)] text-amber-900" },
    { label: "B Besprechung mit Andrea...", colorClass: "bg-[var(--figma-purple-2)] text-violet-900" },
    { label: "C Feature 1234", colorClass: "bg-[var(--figma-green-2)] text-emerald-900" },
    { label: "Admin Aufgaben", colorClass: "bg-[var(--figma-neutral-90)] text-[var(--figma-neutral-32)]" },
  ],
  2: [
    { label: "C Ticket 2445", colorClass: "bg-[var(--figma-green-2)] text-emerald-900" },
    { label: "C Ticket 6372", colorClass: "bg-[var(--figma-green-2)] text-emerald-900" },
    { label: "A Feedback umsetzen Tick...", colorClass: "bg-[var(--figma-amber-2)] text-amber-900" },
    { label: "Lernende betreuen", colorClass: "bg-[var(--figma-amber-2)] text-amber-900" },
  ],
  3: [
    { label: "B Feature 8392", colorClass: "bg-[var(--figma-purple-2)] text-violet-900" },
    { label: "C Code Review", colorClass: "bg-[var(--figma-green-2)] text-emerald-900" },
    { label: "IS Schulung am Arbeitsplatz", colorClass: "bg-[var(--figma-neutral-90)] text-[var(--figma-neutral-32)]" },
  ],
  4: [
    { label: "A Weekly im Team", colorClass: "bg-[var(--figma-amber-2)] text-amber-900" },
    { label: "B Meeting mit Sebastian W...", colorClass: "bg-[var(--figma-purple-2)] text-violet-900" },
    { label: "Mails lesen", colorClass: "bg-[var(--figma-neutral-90)] text-[var(--figma-neutral-32)]" },
    { label: "Updates", colorClass: "bg-[var(--figma-neutral-90)] text-[var(--figma-neutral-32)]" },
  ],
  5: [
    { label: "A Feedback zu Ticket 2792...", colorClass: "bg-[var(--figma-amber-2)] text-amber-900" },
    { label: "Code Review", colorClass: "bg-[var(--figma-amber-2)] text-amber-900" },
    { label: "Support", colorClass: "bg-[var(--figma-amber-2)] text-amber-900" },
    { label: "Admin Aufgaben", colorClass: "bg-[var(--figma-neutral-90)] text-[var(--figma-neutral-32)]" },
  ],
};

function isWeekend(day: number): boolean {
  const d = new Date(2025, 11, day);
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

function getHours(day: number): string {
  if (isWeekend(day)) return "0 Std.";
  if (day === 8) return "0 Std.";
  if (day >= 9 && day <= 14) return "0 Std.";
  return "8 Std.";
}

export function getDemoCalendar(): { weeks: DayData[][]; weekTotals: string[] } {
  const week1Days = [1, 2, 3, 4, 5, 6, 7];
  const week2Days = [8, 9, 10, 11, 12, 13, 14];

  const toDayData = (day: number): DayData => ({
    day,
    month: MONTH,
    hours: getHours(day),
    isToday: day === 8,
    isWeekend: isWeekend(day),
    entries: DEMO_ENTRIES[day] ?? [],
  });

  return {
    weeks: [week1Days.map(toDayData), week2Days.map(toDayData)],
    weekTotals: ["40 Std. + 0 Std.", "0 Std. + 0 Std."],
  };
}
