import { SheetMusic } from "@/types";

export async function searchIMSLP(query: string): Promise<SheetMusic[]> {
  try {
    const searchUrl = `https://imslp.org/imslpscripts/API.ISCR.php?account=worklist/disclaimer=accepted/sort=popular/type=2/start=0/retformat=json&search=${encodeURIComponent(query)}`;

    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Classica-App/1.0" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return buildFallbackLinks(query);

    const text = await res.text();

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return buildFallbackLinks(query);
    }

    const results: SheetMusic[] = [];

    for (const key of Object.keys(data)) {
      if (key === "metadata") continue;
      const entry = data[key] as { id?: string; permlink?: string } | undefined;
      if (!entry || typeof entry !== "object") continue;

      const id = entry.id || entry.permlink || key;
      const title =
        typeof id === "string" ? id.replace(/_/g, " ") : `Sheet Music ${key}`;
      const url = `https://imslp.org/wiki/${encodeURI(String(id))}`;

      results.push({ title, url, composer: "" });
      if (results.length >= 5) break;
    }

    return results.length > 0 ? results : buildFallbackLinks(query);
  } catch {
    return buildFallbackLinks(query);
  }
}

function buildFallbackLinks(query: string): SheetMusic[] {
  return [
    {
      title: `Search "${query}" on IMSLP`,
      url: `https://imslp.org/wiki/Special:Search?search=${encodeURIComponent(query)}&go=Go`,
      composer: "",
    },
  ];
}
