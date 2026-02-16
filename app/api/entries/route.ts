import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** GET /api/entries?date=2026-02-23 – Einträge für ein Datum. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Query 'date' fehlt (z.B. date=2026-02-23)" }, { status: 400 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("time_entries")
      .select("id, date, start_time, end_time, label, comment, is_billable")
      .eq("date", date)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** POST /api/entries – Neuen Eintrag anlegen. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const date = body.date ?? "";
    const start_time = body.start_time ?? "";
    const end_time = body.end_time ?? "";
    const label = body.label ?? "";
    const comment = body.comment ?? "";
    const is_billable = body.is_billable !== false;
    if (!date || !label) {
      return NextResponse.json({ error: "date und label sind Pflichtfelder" }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("time_entries")
      .insert([{ date, start_time, end_time, label, comment, is_billable }])
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
