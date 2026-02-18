import { LEISTUNG_OPTIONS } from "./constants";

/** Mock Jira base URL – keine echte Schnittstelle, nur Platzhalter. */
export const JIRA_BASE_URL = "https://jira.example.com/browse";

const JIRA_TICKET_PATTERN = /\b(PROJ|INC|CHG)-(\d+)\b/i;

const INTERNAL_LABELS = new Set([
  ...LEISTUNG_OPTIONS,
  "Interne Schulung (IS)",
  "Administration",
  "Frei (80%)",
  "Weekly im Team",
  "Lernende betreuen",
]);

/**
 * Extrahiert die erste Jira-Ticket-ID aus einem Label (z.B. PROJ-2847, INC-4521).
 */
export function extractJiraTicketId(label: string): string | null {
  const m = label.match(JIRA_TICKET_PATTERN);
  return m ? `${m[1]!.toUpperCase()}-${m[2]}` : null;
}

/**
 * Prüft, ob eine Ticket-ID ein ITSM-Ticket ist (INC, CHG).
 * PROJ = Jira, INC/CHG = ITSM. Die Logik kommt aus dem Ticket-Typ, nicht aus dem User.
 */
export function isItsmTicketId(ticketId: string): boolean {
  const prefix = ticketId.split("-")[0]?.toUpperCase();
  return prefix === "INC" || prefix === "CHG";
}

/**
 * Prüft, ob ein Eintrag ein Projekt ist (enthält Jira-Ticket, ist kein interner Eintrag).
 */
export function isProjectEntry(label: string): boolean {
  if (INTERNAL_LABELS.has(label)) return false;
  return extractJiraTicketId(label) !== null;
}

/**
 * Erzeugt die Mock-Jira-URL für ein Ticket.
 */
export function getJiraUrl(ticketId: string): string {
  return `${JIRA_BASE_URL}/${ticketId}`;
}

/**
 * Entfernt die Ticket-ID aus dem Label für die Anzeige in Zeiteinträgen.
 * Z.B. "Migros Bank | Banking Platform | PROJ-2847" -> "Migros Bank | Banking Platform"
 */
export function labelWithoutTicketId(label: string, ticketId: string): string {
  const suffix = ` | ${ticketId}`;
  if (label.endsWith(suffix)) return label.slice(0, -suffix.length).trim();
  if (label === ticketId) return "";
  return label.replace(ticketId, "").replace(/\s*[|\-–]\s*$/, "").replace(/^\s*[|\-–]\s*/, "").trim();
}

/** Mock-Daten von Jira (künftig via Schnittstelle). */
export interface JiraTicketDetails {
  projekt: string;
  objektNr: string;
  objektBetreff: string;
  objektartLea: string;
  slaService: string;
  ktrKst: string;
  abrechnungsart: string;
  status: string;
}

/**
 * Liefert Mock-Jira-Daten für ein Ticket. Künftig: API-Aufruf.
 */
export function getMockJiraDetails(ticketId: string, projectLabel: string): JiraTicketDetails {
  const prefix = ticketId.split("-")[0];
  const num = ticketId.split("-")[1] ?? "0";
  return {
    projekt: projectLabel,
    objektNr: `OBJ-${num}${prefix === "INC" ? "I" : prefix === "CHG" ? "C" : ""}`,
    objektBetreff: prefix === "PROJ" ? `Projekt ${projectLabel}` : `Ticket ${ticketId}: ${projectLabel}`,
    objektartLea: prefix === "PROJ" ? "CHM" : prefix === "INC" ? "INM" : "CHM",
    slaService: "Standard",
    ktrKst: `KST-${num.padStart(4, "0")}`,
    abrechnungsart: "Zeit und Material",
    status: "In Bearbeitung",
  };
}
