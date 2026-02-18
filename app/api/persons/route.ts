import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { DEFAULT_USER_SLUG } from "@/lib/constants";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userSlug = url.searchParams.get("user") || DEFAULT_USER_SLUG;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("persons")
      .select("user_slug, display_name, target_hours_per_week")
      .eq("user_slug", userSlug)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(null);
      }
      console.error("Supabase persons error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ? { ...data, target_hours_per_week: Number(data.target_hours_per_week) } : null);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
