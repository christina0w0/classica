import { Client } from "@notionhq/client";
import { PracticeSession } from "@/types";

const PLANNING_DATABASE_ID = "1725c6b8b015815f80e7e30b26fa4b1d";

function getNotionClient(): Client | null {
  const token = process.env.NOTION_API_KEY;
  if (!token) return null;
  return new Client({ auth: token });
}

function getActivityPageId(): string | undefined {
  return process.env.NOTION_ACTIVITY_PAGE_ID || undefined;
}

export function isNotionConfigured(): boolean {
  return Boolean(process.env.NOTION_API_KEY);
}

function formatReflectionText(session: PracticeSession, appBaseUrl?: string): string {
  const lines: string[] = [];

  lines.push(`Piece: ${session.composerName} — ${session.pieceName}`);
  lines.push("");

  if (session.reflection?.whatWentWell) {
    lines.push(`What went well: ${session.reflection.whatWentWell}`);
  }
  if (session.reflection?.needsWork) {
    lines.push(`Needs work: ${session.reflection.needsWork}`);
  }
  if (session.reflection?.nextFocus) {
    lines.push(`Next focus: ${session.reflection.nextFocus}`);
  }

  if (session.reflection?.whatWentWell || session.reflection?.needsWork || session.reflection?.nextFocus) {
    lines.push("");
  }

  if (session.reflection?.journal) {
    lines.push("Journal:");
    lines.push(session.reflection.journal);
    lines.push("");
  }

  if (appBaseUrl) {
    lines.push(`${appBaseUrl}/practice`);
  }

  return lines.join("\n");
}

export async function syncSessionToNotion(
  session: PracticeSession,
  appBaseUrl?: string,
): Promise<{ notionPageId: string; notionPageUrl: string }> {
  const notion = getNotionClient();
  if (!notion) throw new Error("Notion API key not configured");

  const activityPageId = getActivityPageId();
  const reflectionText = formatReflectionText(session, appBaseUrl);

  const endDate = new Date(session.date);
  const startDate = new Date(endDate.getTime() - session.duration * 1000);

  const classicaUrl = appBaseUrl ? `${appBaseUrl}/practice` : "";

  const properties: Record<string, unknown> = {
    Record: {
      title: [{ text: { content: "Violin" } }],
    },
    Start: {
      date: { start: startDate.toISOString() },
    },
    End: {
      date: { start: endDate.toISOString() },
    },
    Reflection: {
      rich_text: [{ text: { content: reflectionText.slice(0, 2000) } }],
    },
  };

  if (classicaUrl) {
    properties["media (if any)"] = {
      files: [{ type: "external", name: "Classica", external: { url: classicaUrl } }],
    };
  }

  if (activityPageId) {
    properties["Activities Done"] = {
      relation: [{ id: activityPageId }],
    };
  }

  if (session.notionPageId) {
    const response = await notion.pages.update({
      page_id: session.notionPageId,
      properties: properties as Parameters<typeof notion.pages.update>[0]["properties"],
    });
    const url = "url" in response ? (response.url as string) : "";
    return { notionPageId: session.notionPageId, notionPageUrl: url };
  }

  const response = await notion.pages.create({
    parent: { database_id: PLANNING_DATABASE_ID },
    properties: properties as Parameters<typeof notion.pages.create>[0]["properties"],
  });

  const url = "url" in response ? (response.url as string) : "";
  return { notionPageId: response.id, notionPageUrl: url };
}

export async function createCalendarEvent(
  session: PracticeSession,
  appBaseUrl?: string,
): Promise<{ notionPageId: string; notionPageUrl: string }> {
  return syncSessionToNotion(session, appBaseUrl);
}

export async function testConnection(): Promise<{ ok: boolean; error?: string; dbName?: string }> {
  const notion = getNotionClient();
  if (!notion) return { ok: false, error: "Notion API key not configured" };

  try {
    const db = await notion.databases.retrieve({ database_id: PLANNING_DATABASE_ID });
    const title = "title" in db ? (db.title as Array<{ plain_text: string }>).map(t => t.plain_text).join("") : "Unknown";
    return { ok: true, dbName: title };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed";
    return { ok: false, error: message };
  }
}
