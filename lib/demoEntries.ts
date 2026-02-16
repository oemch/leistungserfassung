import type { Entry } from "./types";

/** Demo-Einträge Februar 2026 – A Gelb #FFF5D6, B Violett #E6DEF3, C Grün #D5EEEB. Start/Endzeit für 16.–20.2. */
export const DEMO_ENTRIES: Record<string, Entry[]> = {
  "16": [
    { text: "A Code Review", bg: "#FFF5D6", fg: "#00271D", startTime: "08:00", endTime: "09:30" },
    { text: "B Besprechung mit Andrea...", bg: "#E6DEF3", fg: "#00271D", startTime: "09:30", endTime: "10:45" },
    { text: "C Feature 1234", bg: "#D5EEEB", fg: "#00271D", startTime: "11:00", endTime: "12:30" },
    { text: "Admin Aufgaben", bg: "var(--figma-neutral-90)", fg: "#00271D", startTime: "14:00", endTime: "15:00" },
  ],
  "17": [
    { text: "C Ticket 2445", bg: "#D5EEEB", fg: "#00271D", startTime: "08:15", endTime: "10:00" },
    { text: "C Ticket 6372", bg: "#D5EEEB", fg: "#00271D", startTime: "10:15", endTime: "11:30" },
    { text: "A Feedback umsetzen Tick...", bg: "#FFF5D6", fg: "#00271D", startTime: "13:00", endTime: "14:30" },
    { text: "A Lernende betreuen", bg: "#FFF5D6", fg: "#00271D", startTime: "15:00", endTime: "16:30" },
  ],
  "18": [
    { text: "B Feature 8392", bg: "#E6DEF3", fg: "#00271D", startTime: "08:00", endTime: "10:30" },
    { text: "C Code Review", bg: "#D5EEEB", fg: "#00271D", startTime: "11:00", endTime: "12:00" },
    { text: "IS Schulung am Arbeitsplatz", bg: "var(--figma-neutral-90)", fg: "#00271D", startTime: "13:30", endTime: "16:00" },
  ],
  "19": [
    { text: "A Weekly im Team", bg: "#FFF5D6", fg: "#00271D", startTime: "09:00", endTime: "10:00" },
    { text: "B Meeting mit Sebastian W...", bg: "#E6DEF3", fg: "#00271D", startTime: "10:30", endTime: "11:45" },
    { text: "Mails lesen", bg: "var(--figma-neutral-90)", fg: "#00271D", startTime: "14:00", endTime: "14:45" },
    { text: "Updates", bg: "var(--figma-neutral-90)", fg: "#00271D", startTime: "15:00", endTime: "16:00" },
  ],
  "20": [
    { text: "A Feedback zu Ticket 2792...", bg: "#FFF5D6", fg: "#00271D", startTime: "08:30", endTime: "10:00" },
    { text: "A Code Review", bg: "#FFF5D6", fg: "#00271D", startTime: "10:15", endTime: "11:15" },
    { text: "A Support", bg: "#FFF5D6", fg: "#00271D", startTime: "13:00", endTime: "14:30" },
    { text: "Admin Aufgaben", bg: "var(--figma-neutral-90)", fg: "#00271D", startTime: "15:00", endTime: "17:00" },
  ],
  "24": [],
};
