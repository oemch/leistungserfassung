/**
 * Extrahiert Design-Tokens (Farben, Typo) aus dem Figma-Node-JSON.
 * Verwendet für figma-demo5 (Design aus API).
 */

type FigmaRgba = { r: number; g: number; b: number; a?: number };

function rgbaToHex({ r, g, b, a = 1 }: FigmaRgba): string {
  const toByte = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 255);
  const hex = [r, g, b].map(toByte).map((n) => n.toString(16).padStart(2, "0")).join("");
  return a < 1 ? `#${hex}${toByte(a).toString(16).padStart(2, "0")}` : `#${hex}`;
}

function walkFills(node: unknown, colors: Set<string>): void {
  if (!node || typeof node !== "object") return;
  const n = node as Record<string, unknown>;
  if (Array.isArray(n.fills)) {
    for (const fill of n.fills as Array<{ type?: string; color?: FigmaRgba }>) {
      if (fill?.type === "SOLID" && fill.color) colors.add(rgbaToHex(fill.color));
    }
  }
  if (Array.isArray(n.children)) {
    for (const child of n.children) walkFills(child, colors);
  }
}

function walkTextStyles(node: unknown, textStyles: Array<{ fontSize?: number; fontFamily?: string; fontWeight?: number }>): void {
  if (!node || typeof node !== "object") return;
  const n = node as Record<string, unknown>;
  if (n.type === "TEXT" && n.style && typeof n.style === "object") {
    const s = n.style as Record<string, unknown>;
    textStyles.push({
      fontSize: typeof s.fontSize === "number" ? s.fontSize : undefined,
      fontFamily: typeof s.fontFamily === "string" ? s.fontFamily : undefined,
      fontWeight: typeof s.fontWeight === "number" ? s.fontWeight : undefined,
    });
  }
  if (Array.isArray(n.children)) {
    for (const child of n.children) walkTextStyles(child, textStyles);
  }
}

export type FigmaParsedTokens = {
  colors: string[];
  fontSizes: number[];
  fontFamily: string | undefined;
  fontWeight: number | undefined;
};

/**
 * Parst das document-Objekt eines Figma-Nodes und gibt gesammelte Tokens zurück.
 */
export function parseFigmaNodeDocument(document: unknown): FigmaParsedTokens {
  const colors = new Set<string>();
  const textStyles: Array<{ fontSize?: number; fontFamily?: string; fontWeight?: number }> = [];
  walkFills(document, colors);
  walkTextStyles(document, textStyles);

  const fontSizes = [...new Set(textStyles.map((s) => s.fontSize).filter((n): n is number => typeof n === "number"))].sort((a, b) => a - b);
  const fontFamily = textStyles.find((s) => s.fontFamily)?.fontFamily;
  const fontWeight = textStyles.find((s) => s.fontWeight)?.fontWeight;

  return {
    colors: [...colors],
    fontSizes,
    fontFamily,
    fontWeight,
  };
}
