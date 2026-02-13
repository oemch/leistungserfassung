"use client";

import "./figma-tokens.css";
import { AppHeader } from "../figma-demo3/components/AppHeader";
import { ControlSection } from "../figma-demo3/components/ControlSection";
import { FavoritesBar } from "../figma-demo3/components/FavoritesBar";
import { CalendarGrid } from "../figma-demo3/components/CalendarGrid";
import { getDemoCalendar } from "../figma-demo3/data/demoCalendar";
import type { FigmaParsedTokens } from "@/lib/figma-parser";

interface FigmaDemo5ClientProps {
  figmaDevLink: string;
  error: string | null;
  parsedTokens: FigmaParsedTokens | null;
}

export default function FigmaDemo5Client({
  figmaDevLink,
  error,
  parsedTokens,
}: FigmaDemo5ClientProps) {
  const { weeks, weekTotals } = getDemoCalendar();

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-[#E7E6E5] shadow-sm p-6 text-center">
          <h1 className="text-lg font-semibold text-[#100C08] mb-2">
            Design aus Figma (59-17885)
          </h1>
          <p className="text-sm text-[#696561] mb-4">{error}</p>
          <p className="text-xs text-[#B5B1AD] mb-4">
            Diese Seite lädt das Figma-Design per API. Token in .env.local eintragen
            (FIGMA_ACCESS_TOKEN), dann Seite neu laden.
          </p>
          <a
            href={figmaDevLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#04775B] hover:underline"
          >
            Design in Figma (Dev Mode) öffnen
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="figma-demo5 min-h-screen"
      style={{
        backgroundColor: "var(--figma-neutral-97)",
        color: "var(--figma-bw-black)",
      }}
    >
      {parsedTokens && (
        <style suppressHydrationWarning>
          {[
            parsedTokens.fontSizes[0] &&
              `.figma-demo5 { --figma-font-size-base: ${parsedTokens.fontSizes[0]}px; }`,
            parsedTokens.fontFamily &&
              `.figma-demo5 { --figma-font-family: ${parsedTokens.fontFamily}; }`,
          ]
            .filter(Boolean)
            .join("\n")}
        </style>
      )}
      <AppHeader />
      <ControlSection />
      <FavoritesBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <CalendarGrid weeks={weeks} weekTotals={weekTotals} />
      </main>
    </div>
  );
}
