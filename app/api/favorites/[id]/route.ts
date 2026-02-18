import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { DEFAULT_USER_SLUG } from "@/lib/constants";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  try {
    const body = await req.json();
    const user_slug = body.user_slug ?? DEFAULT_USER_SLUG;
    const updates: Record<string, unknown> = {};
    if (body.label !== undefined) updates.label = String(body.label).trim();
    if (body.bg !== undefined) updates.bg = body.bg;
    if (body.fg !== undefined) updates.fg = body.fg;
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Keine Felder zum Aktualisieren (label, bg, fg, sort_order)" }, { status: 400 });
    }
    updates.updated_at = new Date().toISOString();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("favorites")
      .update(updates)
      .eq("id", id)
      .eq("user_slug", user_slug)
      .select("id, label, bg, fg, sort_order")
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  try {
    const url = new URL(req.url);
    const userSlug = url.searchParams.get("user") || DEFAULT_USER_SLUG;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("favorites").delete().eq("id", id).eq("user_slug", userSlug);
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
