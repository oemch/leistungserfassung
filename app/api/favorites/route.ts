import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { DEFAULT_USER_SLUG } from "@/lib/constants";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userSlug = url.searchParams.get("user") || DEFAULT_USER_SLUG;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("favorites")
      .select("id, label, bg, fg, sort_order")
      .eq("user_slug", userSlug)
      .order("sort_order", { ascending: true });
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const label = (body.label ?? "").trim();
    const bg = body.bg ?? "#EFEEED";
    const fg = body.fg ?? "#00271D";
    const sort_order = typeof body.sort_order === "number" ? body.sort_order : 0;
    const user_slug = body.user_slug ?? DEFAULT_USER_SLUG;
    if (!label) {
      return NextResponse.json({ error: "label ist Pflichtfeld" }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("favorites")
      .insert([{ label, bg, fg, sort_order, user_slug }])
      .select("id, label, bg, fg, sort_order")
      .single();
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Favorit mit diesem Label existiert bereits" }, { status: 409 });
      }
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
