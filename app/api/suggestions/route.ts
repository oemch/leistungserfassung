import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { DEFAULT_USER_SLUG } from "@/lib/constants";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userSlug = url.searchParams.get("user") || DEFAULT_USER_SLUG;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("suggestions")
      .select("id, target_user_slug, source_type, source_user_name, project_label, description, duration_hours, start_time, end_time, accent_color, date_str, created_at")
      .eq("target_user_slug", userSlug)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase suggestions error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const suggestions = (data ?? []).map((r) => ({
      id: r.id,
      targetUserSlug: r.target_user_slug,
      sourceType: r.source_type,
      sourceUserName: r.source_user_name ?? undefined,
      projectLabel: r.project_label,
      description: r.description ?? "",
      durationHours: Number(r.duration_hours),
      startTime: r.start_time ?? undefined,
      endTime: r.end_time ?? undefined,
      accentColor: r.accent_color ?? "#EFEEED",
      dateStr: r.date_str ?? undefined,
      createdAt: r.created_at,
    }));
    return NextResponse.json(suggestions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const target_user_slug = (body.targetUserSlug ?? body.target_user_slug ?? "").trim();
    const source_type = body.sourceType ?? body.source_type ?? "team";
    const source_user_name = body.sourceUserName ?? body.source_user_name ?? null;
    const project_label = (body.projectLabel ?? body.project_label ?? "").trim();
    const description = (body.description ?? "").trim();
    const duration_hours = Number(body.durationHours ?? body.duration_hours ?? 1);
    const start_time = body.startTime ?? body.start_time ?? null;
    const end_time = body.endTime ?? body.end_time ?? null;
    const accent_color = (body.accentColor ?? body.accent_color ?? "#EFEEED").trim();
    const date_str = body.dateStr ?? body.date_str ?? null;

    if (!target_user_slug || !project_label) {
      return NextResponse.json({ error: "targetUserSlug und projectLabel sind Pflichtfelder" }, { status: 400 });
    }
    if (!["calendar", "team"].includes(source_type)) {
      return NextResponse.json({ error: "sourceType muss 'calendar' oder 'team' sein" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("suggestions")
      .insert([
        {
          target_user_slug,
          source_type,
          source_user_name,
          project_label,
          description,
          duration_hours,
          start_time,
          end_time,
          accent_color,
          date_str,
        },
      ])
      .select("id, target_user_slug, source_type, source_user_name, project_label, description, duration_hours, start_time, end_time, accent_color, date_str, created_at")
      .single();
    if (error) {
      console.error("Supabase suggestions insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const created = {
      id: data.id,
      targetUserSlug: data.target_user_slug,
      sourceType: data.source_type,
      sourceUserName: data.source_user_name ?? undefined,
      projectLabel: data.project_label,
      description: data.description ?? "",
      durationHours: Number(data.duration_hours),
      startTime: data.start_time ?? undefined,
      endTime: data.end_time ?? undefined,
      accentColor: data.accent_color ?? "#EFEEED",
      dateStr: data.date_str ?? undefined,
      createdAt: data.created_at,
    };
    return NextResponse.json(created);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
