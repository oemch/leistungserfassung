import { jsPDF } from "jspdf";
import type { Entry } from "./types";
import { getSollPerDay } from "./constants";
import {
  effectiveHoursForDisplay,
  formatHoursDecimal,
  getISOWeekNumber,
  parseDateLocal,
} from "./timeUtils";

const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function formatDateReport(dateStr: string): string {
  const date = parseDateLocal(dateStr);
  const [y, m, d] = dateStr.split("-").map(Number);
  const dayShort = WOCHENTAGE[date.getDay()];
  return `${dayShort}. ${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

function getDatesInMonth(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    result.push(
      `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
  }
  return result;
}

function isWorkday(dateStr: string): boolean {
  const d = parseDateLocal(dateStr).getDay();
  return d >= 1 && d <= 5; // Mo–Fr
}

/** Geschätzte Pausenzeit in Stunden (z.B. Mittag) – mockt 0.5h pro Arbeitstag mit Buchungen */
function estimatePauseHours(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  const withTimes = entries.filter((e) => e.startTime && e.endTime);
  if (withTimes.length <= 1) return 0;
  return 0.5; // typische Mittagspause
}

/** Zuschläge pro Tag – aus Einträgen oder leer (keine Surcharge-Daten in Entries) */
function getZuschlaegeForDay(_dateStr: string, _entries: Entry[]): string {
  return ""; // Keine Zuschlag-Daten in Entries; Block "Zuschläge laufende Periode" zeigt Mock
}

/** Mock: Absenzen laufende Periode aus Einträgen oder leer */
function getAbsenzenLaufendePeriode(entriesByDate: Record<string, Entry[]>, dateStrs: string[]): { label: string; stunden: number }[] {
  const seen = new Map<string, number>();
  for (const dateStr of dateStrs) {
    const entries = entriesByDate[dateStr] ?? [];
    for (const e of entries) {
      if (["Homeoffice", "Ferien", "Krankheit", "Freier Tag"].includes(e.text)) {
        const h = e.startTime && e.endTime ? effectiveHoursForDisplay(e.startTime, e.endTime, e.text) : 0;
        seen.set(e.text, (seen.get(e.text) ?? 0) + h);
      }
    }
  }
  if (seen.size === 0) return [{ label: "Homeoffice", stunden: 0 }];
  return Array.from(seen.entries()).map(([label, stunden]) => ({ label, stunden }));
}

/** Mock: Zuschläge laufende Periode – wenn keine Daten */
function getZuschlaegeLaufendePeriode(entriesByDate: Record<string, Entry[]>, dateStrs: string[]): { label: string; anzahl: number }[] {
  const counts = new Map<string, number>();
  for (const dateStr of dateStrs) {
    const z = getZuschlaegeForDay(dateStr, entriesByDate[dateStr] ?? []);
    if (z) {
      const match = z.match(/^([\d.]+)\s*-\s*(.+)$/);
      const label = match ? match[2].trim() : z;
      const anzahl = match ? parseFloat(match[1]) || 1 : 1;
      counts.set(label, (counts.get(label) ?? 0) + anzahl);
    }
  }
  if (counts.size === 0) {
    return [
      { label: "Ad-hoc-Piketteinsatz", anzahl: 1 },
      { label: "Pikett 1 Tag Mo Fr", anzahl: 3 },
      { label: "Pikett Tage SA+SO IT", anzahl: 1 },
    ];
  }
  return Array.from(counts.entries()).map(([label, anzahl]) => ({ label, anzahl }));
}

export interface MonatsjournalData {
  year: number;
  month: number;
  userSlug: string;
  userName: string;
  entriesByDate: Record<string, Entry[]>;
  targetHoursPerWeek?: number;
}

export function generateMonatsjournalPdf(data: MonatsjournalData): void {
  const { year, month, userSlug, userName, entriesByDate, targetHoursPerWeek = 40 } = data;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;
  const lineH = 5.5;
  const fontNorm = 9;
  const fontSmall = 7;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const firstDay = `${String(1).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
  const lastDayNum = new Date(year, month, 0).getDate();
  const lastDay = `${String(lastDayNum).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
  doc.text(`Monatsjournal vom ${firstDay} - ${lastDay}`, margin, y);
  y += lineH + 2;

  doc.setFontSize(fontNorm);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${userName}`, margin, y);
  doc.text(
    `Beschäftigungsgrad: ${targetHoursPerWeek === 32 ? "TZ 80%" : targetHoursPerWeek === 36 ? "TZ 90%" : "VZ 100%"}`,
    pageW - margin,
    y,
    { align: "right" }
  );
  y += lineH + 8;

  // Ferienabrechnung (mockt)
  const ferienRows = [
    { label: "Ferienanspruch", stunden: 222.0, tage: 30.0 },
    { label: "Übertrag Vorjahr", stunden: 41.8, tage: 5.65 },
    { label: "Anspruch DAG", stunden: 0, tage: 0 },
    { label: "TOTAL Anspruch 2026", stunden: 263.8, tage: 35.65, bold: true },
    { label: "Ferienbezug", stunden: 0, tage: 0 },
    { label: "Rückst. VAP", stunden: 0, tage: 0 },
    { label: "Zwischensaldo", stunden: 263.8, tage: 35.65, bold: true },
    { label: "Direkte Kürzung", stunden: 0, tage: 0 },
    { label: "Indirekte Kürzung", stunden: 0, tage: 0 },
    { label: "Korrekturen Ferien/DAG/VAP", stunden: 0, tage: 0 },
    { label: "Aktueller Saldo", stunden: 263.8, tage: 35.65, bold: true },
    { label: "Aktueller Saldo gerundet", stunden: null, tage: 35.5 },
    { label: "Feriensaldo inkl. geplante Ferien", stunden: -54.4, tage: -7.35 },
    { label: "Feriensaldo inkl. geplante Ferien gerundet per 31.12.2026", stunden: null, tage: -7.5 },
  ];
  const fColW = [70, 25, 25];
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, fColW.reduce((a, b) => a + b, 0) + 4, lineH + 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSmall);
  doc.text("Ferienabrechnung", margin + 2, y + lineH);
  doc.text("Stunden", margin + 72, y + lineH);
  doc.text("Tage", margin + 97, y + lineH);
  y += lineH + 5;
  doc.setFont("helvetica", "normal");
  for (const row of ferienRows) {
    doc.text(row.label, margin + 2, y + 2);
    doc.text(
      row.stunden != null ? formatHoursDecimal(row.stunden, 2) : "",
      margin + 74,
      y + 2,
      { align: "right" }
    );
    doc.text(
      row.tage != null ? formatHoursDecimal(row.tage, 2) : "",
      margin + 100,
      y + 2,
      { align: "right" }
    );
    if (row.bold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    y += lineH;
  }
  doc.setFont("helvetica", "normal");
  y += 6;

  const dates = getDatesInMonth(year, month);
  const weeks = new Map<number, string[]>();
  for (const dateStr of dates) {
    const kw = getISOWeekNumber(dateStr);
    if (!weeks.has(kw)) weeks.set(kw, []);
    weeks.get(kw)!.push(dateStr);
  }
  const sortedWeeks = Array.from(weeks.entries()).sort((a, b) => a[0] - b[0]);
  const sollPerDay = getSollPerDay(targetHoursPerWeek);

  const colW = {
    datum: 24,
    buchungen: 30,
    absenzen: 18,
    geplant: 10,
    ist: 10,
    as: 10,
    pause: 10,
    bewill: 10,
    soll: 10,
    saldo: 12,
    zuschlaege: 28,
  };
  const headers = ["Datum", "Buchungen", "Absenzen", "Geplant", "Ist", "AS", "Pause", "Bewill.", "Soll", "Saldo", "Zuschläge"];
  const headerW = [
    colW.datum,
    colW.buchungen,
    colW.absenzen,
    colW.geplant,
    colW.ist,
    colW.as,
    colW.pause,
    colW.bewill,
    colW.soll,
    colW.saldo,
    colW.zuschlaege,
  ];
  const tableW = headerW.reduce((a, b) => a + b, 0) + (headerW.length - 1) * 2;
  const startX = margin;
  let runningSaldo = 0;

  for (const [kw, weekDates] of sortedWeeks) {
    if (y > 240) {
      doc.addPage();
      y = margin;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontNorm);
    doc.text(`KW ${kw}`, startX, y);
    y += lineH;

    doc.setFillColor(230, 230, 230);
    doc.rect(startX, y - 3, tableW, lineH + 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSmall);
    let x = startX;
    headers.forEach((h, i) => {
      doc.text(h, x + 1, y + 2);
      x += headerW[i] + 2;
    });
    y += lineH + 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSmall);

    let weekIst = 0;
    let weekSoll = 0;
    let weekGeplant = 0;
    let weekAS = 0;
    let weekPause = 0;
    let weekBewill = 0;

    for (const dateStr of weekDates) {
      const entries = entriesByDate[dateStr] ?? [];
      const dayIst = entries.reduce((acc, e) => {
        if (e.startTime && e.endTime) return acc + effectiveHoursForDisplay(e.startTime, e.endTime, e.text);
        return acc;
      }, 0);
      const daySoll = isWorkday(dateStr) ? sollPerDay : 0;
      const daySaldo = dayIst - daySoll;
      runningSaldo += daySaldo;
      weekIst += dayIst;
      weekSoll += daySoll;

      const dayGeplant = 0;
      const dayAS = dayIst;
      const dayPause = estimatePauseHours(entries);
      const dayBewill = dayIst;
      weekGeplant += dayGeplant;
      weekAS += dayAS;
      weekPause += dayPause;
      weekBewill += dayBewill;

      const buchungen = entries
        .filter((e) => e.startTime && e.endTime)
        .map((e) => `${e.startTime} ${e.endTime}`)
        .join(" ");
      const absenzen = entries
        .filter((e) =>
          ["Ferien", "Krankheit", "Heirat in der Familie oder Verwandtschaft", "Homeoffice", "Freier Tag"].includes(e.text)
        )
        .map((e) => e.text)
        .join(" ") || "";
      const zuschlaege = getZuschlaegeForDay(dateStr, entries);

      x = startX;
      doc.text(formatDateReport(dateStr), x, y);
      x += colW.datum + 2;
      doc.text((buchungen || "—").slice(0, 20), x, y);
      x += colW.buchungen + 2;
      doc.text(absenzen.slice(0, 14), x, y);
      x += colW.absenzen + 2;
      doc.text(formatHoursDecimal(dayGeplant, 2), x, y);
      x += colW.geplant + 2;
      doc.text(dayIst > 0 ? formatHoursDecimal(dayIst, 2) : "0.00", x, y);
      x += colW.ist + 2;
      doc.text(dayAS > 0 ? formatHoursDecimal(dayAS, 2) : "0.00", x, y);
      x += colW.as + 2;
      doc.text(dayPause > 0 ? formatHoursDecimal(dayPause, 2) : "0.00", x, y);
      x += colW.pause + 2;
      doc.text(dayBewill > 0 ? formatHoursDecimal(dayBewill, 2) : "0.00", x, y);
      x += colW.bewill + 2;
      doc.text(daySoll > 0 ? formatHoursDecimal(daySoll, 2) : "0.00", x, y);
      x += colW.soll + 2;
      doc.text(formatHoursDecimal(runningSaldo, 2), x, y);
      x += colW.saldo + 2;
      doc.text(zuschlaege.slice(0, 22), x, y);

      y += lineH;
    }

    doc.setFont("helvetica", "bold");
    doc.text("Summe", startX, y);
    let sumX = startX + colW.datum + 2 + colW.buchungen + 2 + colW.absenzen + 2;
    doc.text(formatHoursDecimal(weekGeplant, 2), sumX, y);
    sumX += colW.geplant + 2;
    doc.text(formatHoursDecimal(weekIst, 2), sumX, y);
    sumX += colW.ist + 2;
    doc.text(formatHoursDecimal(weekAS, 2), sumX, y);
    sumX += colW.as + 2;
    doc.text(formatHoursDecimal(weekPause, 2), sumX, y);
    sumX += colW.pause + 2;
    doc.text(formatHoursDecimal(weekBewill, 2), sumX, y);
    sumX += colW.bewill + 2;
    doc.text(formatHoursDecimal(weekSoll, 2), sumX, y);
    sumX += colW.soll + 2;
    doc.text(formatHoursDecimal(runningSaldo, 2), sumX, y);
    doc.setFont("helvetica", "normal");
    y += lineH + 4;
  }

  // Absenzen laufende Periode + Zuschläge laufende Periode (nebeneinander)
  const absenzenList = getAbsenzenLaufendePeriode(entriesByDate, dates);
  const zuschlaegeList = getZuschlaegeLaufendePeriode(entriesByDate, dates);
  const blockW = (pageW - margin * 2 - 10) / 2;
  const blockLeft = margin;
  const blockRight = margin + blockW + 10;

  y += 4;
  const blockHeaderH = lineH + 2;
  doc.setFillColor(230, 230, 230);
  doc.rect(blockLeft, y - 3, blockW, blockHeaderH, "F");
  doc.rect(blockRight, y - 3, blockW, blockHeaderH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSmall);
  doc.text("Absenzen laufende Periode", blockLeft + 2, y + 2);
  doc.text("Zuschläge laufende Periode", blockRight + 2, y + 2);
  y += blockHeaderH;
  doc.setFont("helvetica", "normal");

  const maxRows = Math.max(absenzenList.length, zuschlaegeList.length, 1);
  for (let i = 0; i < maxRows; i++) {
    const a = absenzenList[i];
    const z = zuschlaegeList[i];
    if (a) {
      doc.text(a.label, blockLeft + 2, y + 2);
      doc.text(`${formatHoursDecimal(a.stunden, 2)} h`, blockLeft + blockW - 4, y + 2, { align: "right" });
    }
    if (z) {
      doc.text(z.label, blockRight + 2, y + 2);
      doc.text(`${formatHoursDecimal(z.anzahl, 2)} Anzahl`, blockRight + blockW - 4, y + 2, { align: "right" });
    }
    y += lineH;
  }

  y += 8;
  doc.setFontSize(fontSmall);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `User: ${userSlug}  Stand: ${new Date().toLocaleString("de-CH")}  Seite 1 von 1`,
    margin,
    doc.internal.pageSize.getHeight() - 10
  );
  doc.setTextColor(0, 0, 0);

  doc.save(`Monatsjournal_${year}-${String(month).padStart(2, "0")}_${userSlug}.pdf`);
}
