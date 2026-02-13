import { getFigmaFileNodes } from "@/lib/figma";
import { parseFigmaNodeDocument } from "@/lib/figma-parser";
import FigmaDemo5Client from "./FigmaDemo5Client";

const FIGMA_FILE_KEY = "PRzzftFXrYVfcHkVl8b0ei";
const FIGMA_NODE_ID = "59-17885";
const FIGMA_DEV_LINK =
  "https://www.figma.com/design/PRzzftFXrYVfcHkVl8b0ei/Leistungserfassung?node-id=59-17885&m=dev";

export default async function FigmaDemo5Page() {
  let parsedTokens: Awaited<ReturnType<typeof parseFigmaNodeDocument>> | null = null;
  let error: string | null = null;

  if (process.env.FIGMA_ACCESS_TOKEN) {
    try {
      const res = await getFigmaFileNodes(FIGMA_FILE_KEY, [FIGMA_NODE_ID]);
      const nodeKey = FIGMA_NODE_ID.replace("-", ":");
      const nodeData = res.nodes?.[nodeKey];
      const doc = nodeData?.document;
      if (doc) {
        parsedTokens = parseFigmaNodeDocument(doc);
      } else {
        error = "Node 59-17885 nicht in der Antwort gefunden.";
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Figma API Fehler";
    }
  } else {
    error = "FIGMA_ACCESS_TOKEN nicht gesetzt. In .env.local eintragen.";
  }

  return (
    <FigmaDemo5Client
      figmaDevLink={FIGMA_DEV_LINK}
      error={error}
      parsedTokens={parsedTokens}
    />
  );
}
