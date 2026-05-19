import { NextResponse } from "next/server";
import { fetchComposerImageUrl } from "@/lib/wikipedia";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const imageUrl = await fetchComposerImageUrl(name);
  return NextResponse.json({ imageUrl });
}
