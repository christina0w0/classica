import { NextResponse } from "next/server";
import { fetchComposerBio } from "@/lib/wikipedia";
import { getComposerById } from "@/lib/composers-seed";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const composer = getComposerById(id);

  if (composer) {
    const bio = await fetchComposerBio(composer.name);
    return NextResponse.json({ bio: bio || composer.bio || "" });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (name) {
    const bio = await fetchComposerBio(name);
    return NextResponse.json({ bio });
  }

  return NextResponse.json({ error: "Composer not found" }, { status: 404 });
}
