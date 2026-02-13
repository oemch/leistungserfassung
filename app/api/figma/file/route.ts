import { NextResponse } from "next/server";
import { getFigmaFile } from "@/lib/figma";

const FILE_KEY = "PRzzftFXrYVfcHkVl8b0ei";

/**
 * GET /api/figma/file – Figma-Datei "Leistungserfassung" abrufen.
 * Nur serverseitig; Token aus .env.local (FIGMA_ACCESS_TOKEN).
 */
export async function GET() {
  if (!process.env.FIGMA_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "FIGMA_ACCESS_TOKEN nicht gesetzt. In .env.local eintragen." },
      { status: 503 }
    );
  }
  try {
    const data = await getFigmaFile(FILE_KEY);
    return NextResponse.json({
      name: data.name,
      lastModified: data.lastModified,
      document: data.document,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Figma API Fehler";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
