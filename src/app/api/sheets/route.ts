import { NextResponse } from "next/server";
import { searchIMSLP } from "@/lib/imslp";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const sheets = await searchIMSLP(query);
  return NextResponse.json({ sheets });
}
