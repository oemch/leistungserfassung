import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** PATCH /api/entries/[id] – Eintrag aktualisieren. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const updates: Record<string, unknown> = {};
    if (body.start_time !== undefined) updates.start_time = body.start_time;
    if (body.end_time !== undefined) updates.end_time = body.end_time;
    if (body.label !== undefined) updates.label = body.label;
    if (body.comment !== undefined) updates.comment = body.comment;
    if (body.is_billable !== undefined) updates.is_billable = body.is_billable;
    updates.updated_at = new Date().toISOString();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("time_entries")
      .update(updates)
      .eq("id", id)
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

/** DELETE /api/entries/[id] – Eintrag löschen. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
