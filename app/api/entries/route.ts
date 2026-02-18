import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { DEFAULT_USER_SLUG } from "@/lib/constants";
import { dateToStr } from "@/lib/timeUtils";

export function invalidateAllEntriesCache() {}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const datesParam = url.searchParams.get("dates") ?? url.searchParams.get("date");
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const userSlug = url.searchParams.get("user") ?? DEFAULT_USER_SLUG;

  let dateStrs: string[];
  if (fromParam && toParam) {
    const [fy, fm, fd] = fromParam.split("-").map(Number);
    const [ty, tm, td] = toParam.split("-").map(Number);
    const start = new Date(fy ?? 0, (fm ?? 1) - 1, fd ?? 1);
    const end = new Date(ty ?? 0, (tm ?? 1) - 1, td ?? 1);
    dateStrs = [];
    const cur = new Date(start);
    while (cur <= end) {
      dateStrs.push(dateToStr(cur));
      cur.setDate(cur.getDate() + 1);
    }
  } else if (datesParam) {
    dateStrs = datesParam.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    return NextResponse.json({ error: "Query 'dates' oder 'from'/'to' fehlt" }, { status: 400 });
  }
  if (dateStrs.length === 0) {
    return NextResponse.json({ error: "Keine gültigen Daten angegeben" }, { status: 400 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("time_entries")
      .select("id, date, start_time, end_time, label, comment, is_billable")
      .in("date", dateStrs)
      .eq("user_slug", userSlug)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const rows = (data ?? []) as { id: string; date: string; start_time: string; end_time: string; label: string; comment: string; is_billable: boolean }[];
    const byDate: Record<string, typeof rows> = {};
    dateStrs.forEach((d) => (byDate[d] = []));
    rows.forEach((r) => {
      const d = r.date;
      if (byDate[d]) byDate[d].push(r);
    });
    return NextResponse.json(byDate);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const date = body.date ?? "";
    const start_time = body.start_time ?? "";
    const end_time = body.end_time ?? "";
    const label = body.label ?? "";
    const comment = body.comment ?? "";
    const is_billable = body.is_billable !== false;
    const user_slug = body.user_slug ?? DEFAULT_USER_SLUG;
    if (!date || !label) {
      return NextResponse.json({ error: "date und label sind Pflichtfelder" }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("time_entries")
      .insert([{ date, start_time, end_time, label, comment, is_billable, user_slug }])
      .select("id, date, start_time, end_time, label, comment, is_billable")
      .single();
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
