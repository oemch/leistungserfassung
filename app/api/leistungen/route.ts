import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("leistungen")
      .select("id, label, sort_order")
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("Supabase leistungen error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const labels = (data ?? []).map((r) => r.label);
    return NextResponse.json(labels);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
