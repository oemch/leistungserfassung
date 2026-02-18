export interface Entry {
  text: string;
  bg: string;
  fg: string;
  id?: string;
  startTime?: string;
  endTime?: string;
  comment?: string;
  isBillable?: boolean;
}

export interface EntryPayload {
  id?: string;
  label: string;
  startTime: string;
  endTime: string;
  comment: string;
  isBillable: boolean;
}

export interface FavoriteItem {
  id?: string;
  label: string;
  bg: string;
  fg: string;
  sort_order?: number;
}

export type ViewMode = "Tag" | "Woche" | "Monat" | "Jahr" | "Liste";
