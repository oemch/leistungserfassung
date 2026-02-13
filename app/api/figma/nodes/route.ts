import { NextRequest, NextResponse } from "next/server";
import { getFigmaFileNodes } from "@/lib/figma";

const FILE_KEY = "PRzzftFXrYVfcHkVl8b0ei";

/**
 * GET /api/figma/nodes?ids=115-20171 – Bestimmte Nodes abrufen.
 * node-id aus Figma-URL: 115-20171 (mit Bindestrich).
 */
export async function GET(request: NextRequest) {
  if (!process.env.FIGMA_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "FIGMA_ACCESS_TOKEN nicht gesetzt. In .env.local eintragen." },
      { status: 503 }
    );
  }
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json({ error: "Query-Parameter 'ids' fehlt (z.B. ids=115-20171)." }, { status: 400 });
  }
  const nodeIds = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (nodeIds.length === 0) {
    return NextResponse.json({ error: "Mindestens eine Node-ID angeben." }, { status: 400 });
  }
  try {
    const data = await getFigmaFileNodes(FILE_KEY, nodeIds);
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Figma API Fehler";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
