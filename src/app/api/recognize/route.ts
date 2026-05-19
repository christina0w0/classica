import { NextResponse } from "next/server";
import { recognizeAudio } from "@/lib/acoustid";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Very small blobs usually mean no audio samples were captured.
    // AudD commonly returns #300/#500 in that case; fail fast with a clear message.
    if (audioFile.size < 20_000) {
      return NextResponse.json(
        {
          error:
            "Recording was too short or silent. Record 8–12 seconds and make sure music is playing clearly.",
          ...(process.env.NODE_ENV !== "production"
            ? {
                debug: {
                  filename: audioFile.name,
                  type: audioFile.type,
                  size: audioFile.size,
                },
              }
            : {}),
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const result = await recognizeAudio(buffer, {
      contentType: audioFile.type || undefined,
      filename: audioFile.name || undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Recognition failed";
    return NextResponse.json(
      {
        error: message,
        ...(process.env.NODE_ENV !== "production"
          ? { debug: { hasToken: !!process.env.AUDD_API_TOKEN } }
          : {}),
      },
      { status: 500 },
    );
  }
}
