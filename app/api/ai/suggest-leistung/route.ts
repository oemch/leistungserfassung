import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { LEISTUNG_OPTIONS } from "@/lib/constants";

const schema = z.object({
  label: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

function getModel() {
  const groqKey = process.env.GROQ_API_KEY;
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (groqKey) return { provider: "groq" as const, model: groq("openai/gpt-oss-20b") };
  if (googleKey) return { provider: "google" as const, model: google("gemini-2.0-flash") };
  return null;
}

export async function POST(req: Request) {
  const modelConfig = getModel();
  if (!modelConfig) {
    return NextResponse.json(
      {
        error:
          "Kein KI-Provider konfiguriert. Bitte GROQ_API_KEY (empfohlen, Free Tier) oder GOOGLE_GENERATIVE_AI_API_KEY in .env.local setzen.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const query = (body.query ?? "").trim();
    const dateStr = body.dateStr ?? "";
    const options = (body.options as string[] | undefined) ?? [...LEISTUNG_OPTIONS];

    if (!query) {
      return NextResponse.json({ error: "query fehlt" }, { status: 400 });
    }
    if (!Array.isArray(options) || options.length === 0) {
      return NextResponse.json({ error: "options fehlt oder leer" }, { status: 400 });
    }

    const leistungenList = options.join("\n");

    const systemPrompt = `Du bist ein Assistent für Zeiterfassung. Der Nutzer gibt einen freien Text ein und du mappst ihn auf EINE passende Leistungsart aus seiner Liste.

WICHTIG: Mappe ausschließlich auf diese Leistungen (exakte Bezeichnung übernehmen):
${leistungenList}

Beispiele (Eingabe → label):
- "Hochzeit meines Bruders" / "Heirat" / "Trauung" → Heirat in der Familie oder Verwandtschaft
- "Pikett am Wochenende" / "Pikettbereitschaft" / "Bereitschaft" → Pikettbereitschaft (startTime 08:00, endTime 16:00)
- "Piketteinsatz" / "Pikett-Einsatz" / "Einsatz vor Ort" → Piketteinsatz
- "Krank" / "Krankmeldung" / "Arzt" / "Arztbesuch" → Krankheit
- "Urlaub" / "Ferien" / "Skiurlaub" / "Strandurlaub" → Ferien
- "Schulung" / "Weiterbildung" / "Seminar" / "Kurs" / "IS" → Interne Schulung (IS)
- "Meeting" / "Besprechung" / "Call" / "Teams-Meeting" → Meeting intern
- "Admin" / "Büro" / "Bürokratie" / "Mitarbeitergespräch" → Administration

Regeln:
1. Wähle die passendste Option aus der obigen Liste. Gib NUR eine exakte Bezeichnung zurück.
2. Für Pikettbereitschaft am Wochenende: startTime "08:00", endTime "16:00" (8h). Sonst startTime/endTime null.`;

    const userContent = `Eingabe: "${query}"${dateStr ? ` | Datum: ${dateStr}` : ""}`;

    const { output } = await generateText({
      model: modelConfig.model,
      system: systemPrompt,
      prompt: userContent,
      output: Output.object({
        schema,
        name: "Leistungsvorschlag",
        description: "label: exakte Leistung aus Liste, startTime/endTime: HH:MM oder null",
      }),
      maxRetries: 0,
    });

    const label = output.label?.trim();

    if (!label || !options.includes(label)) {
      return NextResponse.json(
        { error: "KI-Vorschlag entspricht keiner gültigen Leistungsart", raw: output },
        { status: 400 }
      );
    }

    return NextResponse.json({
      label,
      startTime: output.startTime ?? undefined,
      endTime: output.endTime ?? undefined,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Serverfehler";
    const isQuota = typeof msg === "string" && (msg.includes("quota") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED"));
    console.error("AI suggest error:", e);
    if (isQuota) {
      return NextResponse.json(
        {
          error:
            "KI-Quota überschritten. Bitte später erneut versuchen oder GROQ_API_KEY (kostenlos unter console.groq.com) verwenden.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
