/** Eintrag in einer Tageskachel (Projekt/Ticket-Buchung). id = gespeicherter Eintrag (klickbar). */
export interface Entry {
  text: string;
  bg: string;
  fg: string;
  /** Gespeicherter Eintrag (Supabase); fehlt bei Live- und Demo-Einträgen. */
  id?: string;
  startTime?: string;
  endTime?: string;
  comment?: string;
  isBillable?: boolean;
}

/** Payload beim Speichern/Bearbeiten aus dem Dialog. */
export interface EntryPayload {
  id?: string;
  label: string;
  startTime: string;
  endTime: string;
  comment: string;
  isBillable: boolean;
}

/** Favoriten-Chip (Projekt/Ticket für Schnellauswahl) */
export interface FavoriteItem {
  label: string;
  bg: string;
  fg: string;
}

/** Ansicht des Kalenders */
export type ViewMode = "Tag" | "Woche" | "Monat" | "Jahr";
