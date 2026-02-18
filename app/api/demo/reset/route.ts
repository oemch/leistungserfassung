import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { DEMO_ENTRIES, DEMO_LEISTUNGEN, SARA_FAVORITES } from "@/lib/demoData";

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();

    const { data: existing } = await supabase.from("time_entries").select("id");
    const ids = (existing ?? []) as { id: string }[];
    if (ids.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < ids.length; i += batchSize) {
        const chunk = ids.slice(i, i + batchSize).map((r) => r.id);
        await supabase.from("time_entries").delete().in("id", chunk);
      }
    }

    const { error: insertError } = await supabase.from("time_entries").insert(
      DEMO_ENTRIES.map((e) => ({
        date: e.date,
        start_time: e.start_time,
        end_time: e.end_time,
        label: e.label,
        comment: e.comment ?? "",
        is_billable: e.is_billable,
        user_slug: e.user_slug,
      }))
    );

    if (insertError) {
      console.error("Demo reset insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    for (const user of ["sara_meier", "marco_keller"] as const) {
      const { data: favs } = await supabase.from("favorites").select("id").eq("user_slug", user);
      const ids = (favs ?? []) as { id: string }[];
      if (ids.length > 0) {
        for (const { id } of ids) {
          await supabase.from("favorites").delete().eq("id", id);
        }
      }
      if (user === "sara_meier") {
        const list = SARA_FAVORITES.slice(0, 6);
        const { error: favError } = await supabase.from("favorites").insert(
          list.map((f) => ({ ...f, user_slug: user }))
        );
        if (favError) {
          console.error(`Demo reset favorites (${user}) error:`, favError);
        }
      }
    }

    const { data: existingLeistungen } = await supabase.from("leistungen").select("id");
    const leistungIds = (existingLeistungen ?? []) as { id: string }[];
    if (leistungIds.length > 0) {
      await supabase.from("leistungen").delete().in("id", leistungIds.map((r) => r.id));
    }
    const { error: leistError } = await supabase
      .from("leistungen")
      .insert(DEMO_LEISTUNGEN.map((l) => ({ label: l.label, sort_order: l.sort_order })));
    if (leistError) {
      console.error("Demo reset leistungen error:", leistError);
    }

    return NextResponse.json({ ok: true, count: DEMO_ENTRIES.length });
  } catch (e) {
    console.error("Demo reset error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
