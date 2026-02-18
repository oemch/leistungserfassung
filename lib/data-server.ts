import { getSupabaseAdmin } from "./supabase-server";
import { DEFAULT_USER_SLUG } from "./constants";
import { entryFromRow, type DbRow } from "./entryUtils";
import type { Entry, FavoriteItem } from "./types";

export async function fetchLeistungen(): Promise<string[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leistungen")
      .select("label, sort_order")
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("Supabase leistungen error:", error);
      return [];
    }
    return (data ?? []).map((r) => r.label);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchFavorites(userSlug = DEFAULT_USER_SLUG): Promise<FavoriteItem[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("favorites")
      .select("id, label, bg, fg, sort_order")
      .eq("user_slug", userSlug)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("Supabase favorites error:", error);
      return [];
    }
    return (data ?? []).map((r) => ({
    id: r.id,
    label: r.label,
    bg: r.bg ?? "#EFEEED",
    fg: r.fg ?? "#00271D",
    sort_order: r.sort_order,
  }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function fetchEntriesRaw(
  dateStrs: string[],
  userSlug = DEFAULT_USER_SLUG
): Promise<(DbRow & { date: string })[]> {
  if (dateStrs.length === 0) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("time_entries")
    .select("id, date, start_time, end_time, label, comment, is_billable")
    .in("date", dateStrs)
    .eq("user_slug", userSlug)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Supabase entries error:", error);
    return [];
  }
  return (data ?? []) as (DbRow & { date: string })[];
}

export async function fetchEntriesForDates(
  dateStrs: string[],
  favorites: FavoriteItem[],
  userSlug = DEFAULT_USER_SLUG
): Promise<Record<string, Entry[]>> {
  if (dateStrs.length === 0) return {};
  try {
    const rows = await fetchEntriesRaw(dateStrs, userSlug);
    const labelToStyle = new Map(favorites.map((f) => [f.label, { bg: f.bg, fg: f.fg }]));
    const byDate: Record<string, Entry[]> = {};
    dateStrs.forEach((d) => (byDate[d] = []));
    rows.forEach((r) => {
      const d = r.date;
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(entryFromRow(r, labelToStyle));
    });
    return byDate;
  } catch (e) {
    console.error(e);
    return Object.fromEntries(dateStrs.map((d) => [d, []]));
  }
}

export async function fetchRecentLabels(userSlug = DEFAULT_USER_SLUG): Promise<string[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("time_entries")
      .select("label, date, created_at")
      .eq("user_slug", userSlug)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) {
      console.error("Supabase recent labels error:", error);
      return [];
    }
    const seen = new Set<string>();
    const recent: string[] = [];
    for (const r of data ?? []) {
      if (!seen.has(r.label)) {
        seen.add(r.label);
        recent.push(r.label);
      }
    }
    return recent;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchInitialData(dateStrs: string[], userSlug = DEFAULT_USER_SLUG) {
  const [favorites, rows, leistungen, recentLabels] = await Promise.all([
    fetchFavorites(userSlug),
    fetchEntriesRaw(dateStrs, userSlug),
    fetchLeistungen(),
    fetchRecentLabels(userSlug),
  ]);
  const labelToStyle = new Map(favorites.map((f) => [f.label, { bg: f.bg, fg: f.fg }]));
  const byDate: Record<string, Entry[]> = {};
  dateStrs.forEach((d) => (byDate[d] = []));
  rows.forEach((r) => {
    const d = r.date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(entryFromRow(r, labelToStyle));
  });
  return { favorites, entriesByDate: byDate, leistungen, recentLabels };
}
