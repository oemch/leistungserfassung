import { extractJiraTicketId, isProjectEntry } from "./jira";

/** Mock ITSM base URL – keine echte Schnittstelle, nur Platzhalter. */
export const ITSM_BASE_URL = "https://itsm.example.com/tickets";

/**
 * Erzeugt die Mock-ITSM-URL für ein Ticket.
 */
export function getItsmUrl(ticketId: string): string {
  return `${ITSM_BASE_URL}/${ticketId}`;
}

/** Mock-Daten vom ITSM-Tool (künftig via Schnittstelle). */
export interface ItsmTicketDetails {
  ticketId: string;
  ticketName: string;
  ticketArt: string;
  kunde: string;
  projekt: string;
  slaService: string;
  costCenter: string;
  abrechnungsart: string;
}

/**
 * Liefert Mock-ITSM-Daten für ein Ticket. Künftig: API-Aufruf.
 */
export function getMockItsmDetails(ticketId: string, projectLabel: string): ItsmTicketDetails {
  const prefix = ticketId.split("-")[0];
  const num = ticketId.split("-")[1] ?? "0";
  const ticketArt = prefix === "PROJ" ? "CHM" : prefix === "INC" ? "INM" : "CHM";
  return {
    ticketId,
    ticketName: projectLabel,
    ticketArt,
    kunde: "Kunde (Mock)",
    projekt: projectLabel,
    slaService: "Standard",
    costCenter: `KST-${num.padStart(4, "0")}`,
    abrechnungsart: "Zeit und Material",
  };
}

/** Re-export für einheitliche Verwendung. */
export { extractJiraTicketId as extractTicketId, isProjectEntry };
