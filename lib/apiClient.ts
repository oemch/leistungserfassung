export async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    return (res.ok ? await res.json() : fallback) as T;
  } catch {
    return fallback;
  }
}

export type EntryApiRow = {
  id: string;
  date?: string;
  start_time: string;
  end_time: string;
  label: string;
  comment: string;
  is_billable: boolean;
  user_slug?: string;
};

export async function deleteEntry(id: string): Promise<boolean> {
  const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function patchEntry(id: string, body: Record<string, unknown>): Promise<EntryApiRow | null> {
  const res = await fetch(`/api/entries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function postEntry(body: Record<string, unknown>): Promise<EntryApiRow | null> {
  const res = await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export interface SuggestLeistungResult {
  label: string;
  startTime?: string;
  endTime?: string;
}

export async function fetchSuggestions(userSlug: string): Promise<
  Array<{
    id: string;
    targetUserSlug: string;
    sourceType: string;
    sourceUserName?: string;
    projectLabel: string;
    description: string;
    durationHours: number;
    startTime?: string;
    endTime?: string;
    accentColor: string;
    dateStr?: string;
    createdAt: string;
  }>
> {
  const res = await fetch(`/api/suggestions?user=${encodeURIComponent(userSlug)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function postSuggestion(body: Record<string, unknown>): Promise<{
  id: string;
  targetUserSlug: string;
  sourceType: string;
  sourceUserName?: string;
  projectLabel: string;
  description: string;
  durationHours: number;
  startTime?: string;
  endTime?: string;
  accentColor: string;
  dateStr?: string;
  createdAt: string;
} | null> {
  const res = await fetch("/api/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteSuggestion(id: string): Promise<boolean> {
  const res = await fetch(`/api/suggestions/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function suggestLeistung(params: {
  query: string;
  options: string[];
  dateStr?: string;
}): Promise<SuggestLeistungResult | null> {
  const res = await fetch("/api/ai/suggest-leistung", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.label || typeof data.label !== "string") return null;
  return { label: data.label, startTime: data.startTime, endTime: data.endTime };
}
