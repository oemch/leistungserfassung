/** Dauer in Std. aus Start- und Endzeit "HH:MM" (Dezimaltrennzeichen Komma). */
export function durationFromTimes(start: string, end: string): string {
  if (!start || !end) return "0,00";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startM = (sh ?? 0) * 60 + (sm ?? 0);
  const endM = (eh ?? 0) * 60 + (em ?? 0);
  let diffM = endM - startM;
  if (diffM < 0) diffM = 0;
  return (diffM / 60).toFixed(2).replace(".", ",");
}

/** Parst "1,00" oder "1.5" zu Stunden (number). */
export function parseDurationHours(s: string): number | null {
  const normalized = s.trim().replace(",", ".");
  const n = parseFloat(normalized);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

/** Dauer in Stunden (number) aus Start- und Endzeit "HH:MM". */
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

/** Endzeit "HH:MM" aus Start "HH:MM" + Stunden (Dezimal). */
export function endTimeFromStartAndHours(start: string, hours: number): string {
  if (!start) return "";
  const [sh, sm] = start.split(":").map(Number);
  const startM = (sh ?? 0) * 60 + (sm ?? 0);
  const endM = startM + hours * 60;
  const endH = Math.floor(endM / 60) % 24;
  const endMin = Math.round(endM % 60);
  return `${String(endH).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
}
