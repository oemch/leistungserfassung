/**
 * Figma API – nur serverseitig verwenden.
 * Token aus process.env.FIGMA_ACCESS_TOKEN (in .env.local eintragen).
 */

const FIGMA_API_BASE = "https://api.figma.com/v1";

function getHeaders(): HeadersInit {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "FIGMA_ACCESS_TOKEN fehlt. Bitte in .env.local eintragen (siehe .env.local.example)."
    );
  }
  return {
    Accept: "application/json",
    "X-Figma-Token": token,
  };
}

export type FigmaFileKey = string;

/**
 * Figma-Datei abrufen (inkl. Dokument-Struktur).
 * File-Key aus der URL: figma.com/design/PRzzftFXrYVfcHkVl8b0ei/... → Key = PRzzftFXrYVfcHkVl8b0ei
 */
export async function getFigmaFile(fileKey: FigmaFileKey) {
  const res = await fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API: ${res.status} ${res.statusText}. ${text}`);
  }
  return res.json();
}

/**
 * Bestimmten Node (Frame/Komponente) aus einer Datei abrufen.
 * nodeId aus der URL: node-id=59-17885 → "59:17885" (Doppelpunkt für API).
 */
export async function getFigmaFileNodes(
  fileKey: FigmaFileKey,
  nodeIds: string[]
) {
  const ids = nodeIds.map((id) => id.replace("-", ":"));
  const res = await fetch(
    `${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${encodeURIComponent(ids.join(","))}`,
    { headers: getHeaders(), next: { revalidate: 60 } }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API: ${res.status} ${res.statusText}. ${text}`);
  }
  return res.json();
}
