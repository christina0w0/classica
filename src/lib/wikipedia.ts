interface WikiSummary {
  extract?: string;
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
}

async function fetchWikiSummary(name: string): Promise<WikiSummary | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      {
        headers: { "User-Agent": "Classica-App/1.0 (classical music identifier)" },
        next: { revalidate: 86400 },
      },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchComposerBio(composerName: string): Promise<string> {
  const data = await fetchWikiSummary(composerName);
  return data?.extract || "";
}

export async function fetchComposerImageUrl(composerName: string): Promise<string> {
  const data = await fetchWikiSummary(composerName);
  return data?.thumbnail?.source || data?.originalimage?.source || "";
}
