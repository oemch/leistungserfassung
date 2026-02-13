/** Eintrag in einer Tageskachel (Projekt/Ticket-Buchung) */
export interface Entry {
  text: string;
  bg: string;
  fg: string;
}

/** Favoriten-Chip (Projekt/Ticket für Schnellauswahl) */
export interface FavoriteItem {
  label: string;
  bg: string;
  fg: string;
}

/** Ansicht des Kalenders */
export type ViewMode = "Tag" | "Woche" | "Monat" | "Jahr";
