import type { PracticeSession } from "@/types";
import { searchIMSLP } from "@/lib/imslp";
import type { RichTextItemRequest } from "@notionhq/client/build/src/api-endpoints";

function rt(content: string, url?: string): RichTextItemRequest {
  return {
    type: "text",
    text: url ? { content, link: { url } } : { content, link: null },
  };
}

function nonEmptyLines(lines: Array<string | undefined | null>): string[] {
  return lines
    .map((l) => (typeof l === "string" ? l.trim() : ""))
    .filter((l) => l.length > 0);
}

export async function buildNotionReflectionRichText(args: {
  session: PracticeSession;
  origin?: string;
}): Promise<RichTextItemRequest[]> {
  const { session, origin } = args;

  const pieceLine = `Piece: ${session.composerName} — ${session.pieceName}`;

  const reflectionLines = nonEmptyLines([
    session.reflection?.whatWentWell
      ? `What went well: ${session.reflection.whatWentWell}`
      : "",
    session.reflection?.needsWork ? `Needs work: ${session.reflection.needsWork}` : "",
    session.reflection?.nextFocus ? `Next focus: ${session.reflection.nextFocus}` : "",
    session.reflection?.journal ? `Journal:\n${session.reflection.journal}` : "",
  ]);

  const imslpQuery = `${session.composerName} ${session.pieceName}`.trim();
  const sheets = await searchIMSLP(imslpQuery);
  const sheet = sheets[0];
  const sheetUrl = sheet?.url;
  const sheetLabel = sheet?.title || "IMSLP sheet music";

  const deepLink = "classica://practice";
  const webLink = origin ? `${origin.replace(/\/$/, "")}/practice` : "";

  const blocks: RichTextItemRequest[] = [];
  blocks.push(rt(pieceLine));
  blocks.push(rt("\n\n"));

  if (reflectionLines.length > 0) {
    blocks.push(rt(reflectionLines.join("\n")));
    blocks.push(rt("\n\n"));
  }

  if (sheetUrl) {
    blocks.push(rt("Sheet music: "));
    blocks.push(rt(sheetLabel, sheetUrl));
    blocks.push(rt("\n"));
  }

  blocks.push(rt("Practice session: "));
  blocks.push(rt(deepLink, deepLink));
  if (webLink) {
    blocks.push(rt(" (web: "));
    blocks.push(rt(webLink, webLink));
    blocks.push(rt(")"));
  }
  blocks.push(rt("\n"));

  return blocks;
}
