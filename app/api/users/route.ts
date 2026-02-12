import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface UserRequestBody {
  first_name: string;
  last_name: string;
  email: string;
  // Füge hier weitere Felder hinzu, je nach Bedarf
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const body: UserRequestBody = await req.json();

    const first_name = String(body.first_name ?? "").trim();
    const last_name = String(body.last_name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    // Validation
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: "first_name, last_name und email sind Pflichtfelder" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("users")
      .insert([{ first_name, last_name, email }])
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save user data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: data.id }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
