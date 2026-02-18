import { NextResponse } from "next/server";
import { fetchRecentLabels } from "@/lib/data-server";
import { DEFAULT_USER_SLUG } from "@/lib/constants";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userSlug = url.searchParams.get("user") ?? DEFAULT_USER_SLUG;
  try {
    const labels = await fetchRecentLabels(userSlug);
    return NextResponse.json(labels);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
