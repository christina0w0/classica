import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { testConnection, isNotionConfigured } from "@/lib/notion";

const ENV_PATH = join(process.cwd(), ".env.local");

async function readEnvFile(): Promise<string> {
  try {
    return await readFile(ENV_PATH, "utf-8");
  } catch {
    return "";
  }
}

function setEnvVar(content: string, key: string, value: string): string {
  const regex = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  if (regex.test(content)) {
    return content.replace(regex, line);
  }
  return content.trimEnd() + "\n" + line + "\n";
}

export async function GET() {
  const configured = isNotionConfigured();
  const hasApiKey = Boolean(process.env.NOTION_API_KEY);
  const hasActivityId = Boolean(process.env.NOTION_ACTIVITY_PAGE_ID);

  return NextResponse.json({
    configured,
    hasApiKey,
    hasActivityId,
    activityPageId: process.env.NOTION_ACTIVITY_PAGE_ID || "",
    databaseId: "1725c6b8b015815f80e7e30b26fa4b1d",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, activityPageId, action } = body as {
      apiKey?: string;
      activityPageId?: string;
      action?: string;
    };

    if (action === "test") {
      const result = await testConnection();
      return NextResponse.json(result);
    }

    let envContent = await readEnvFile();

    if (apiKey !== undefined) {
      envContent = setEnvVar(envContent, "NOTION_API_KEY", apiKey);
      process.env.NOTION_API_KEY = apiKey;
    }

    if (activityPageId !== undefined) {
      envContent = setEnvVar(envContent, "NOTION_ACTIVITY_PAGE_ID", activityPageId);
      process.env.NOTION_ACTIVITY_PAGE_ID = activityPageId;
    }

    await writeFile(ENV_PATH, envContent, "utf-8");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
