import { NextResponse } from "next/server";
import { PracticeSession } from "@/types";
import { createCalendarEvent, isNotionConfigured } from "@/lib/notion";

export async function POST(request: Request) {
  if (!isNotionConfigured()) {
    return NextResponse.json(
      { error: "Notion is not configured. Add your API key in Settings." },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const { session, appBaseUrl } = body as {
      session: PracticeSession;
      appBaseUrl?: string;
    };

    if (!session?.id) {
      return NextResponse.json({ error: "Missing session data" }, { status: 400 });
    }

    const result = await createCalendarEvent(session, appBaseUrl);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calendar event creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
