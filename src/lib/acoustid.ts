import { RecognitionResult, MusicEra } from "@/types";
import { composers } from "./composers-seed";

const AUDD_API_TOKEN = (process.env.AUDD_API_TOKEN || "")
  .trim()
  .replace(/^['"]+|['"]+$/g, "");
const AUDD_API_URL = "https://api.audd.io/";
const MUSICBRAINZ_API_URL = "https://musicbrainz.org/ws/2";

export type RecognizeAudioOptions = {
  contentType?: string;
  filename?: string;
};

export async function recognizeAudio(
  audioBuffer: Buffer,
  options?: RecognizeAudioOptions,
): Promise<RecognitionResult> {
  if (!AUDD_API_TOKEN) {
    throw new Error(
      "AUDD_API_TOKEN not configured. Get a free token at https://dashboard.audd.io/",
    );
  }

  const rawType = options?.contentType?.split(";")[0]?.trim();
  const filename = options?.filename?.replace(/[^\w.\-]/g, "_") || "recording.webm";
  const blobType =
    rawType && rawType !== "application/octet-stream" ? rawType : "audio/webm";

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([new Uint8Array(audioBuffer)], { type: blobType }),
    filename.endsWith(".webm") || filename.endsWith(".mp4") || filename.endsWith(".m4a")
      ? filename
      : blobType.includes("mp4")
        ? "recording.mp4"
        : "recording.webm",
  );
  formData.append("api_token", AUDD_API_TOKEN);
  formData.append("return", "apple_music,musicbrainz");

  const res = await fetch(AUDD_API_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Recognition service error: ${res.status}`);
  }

  const data = await res.json();

  if (data.status === "error") {
    const code = data.error?.error_code;
    if (code === 300 || code === 500) {
      throw new Error(
        "Could not process the audio. Try recording for a bit longer.",
      );
    }
    const base = data.error?.error_message || "Recognition failed";
    throw new Error(code ? `${base} (AudD #${code})` : base);
  }

  if (!data.result) {
    throw new Error(
      "Could not identify this piece. Try playing the recording louder or closer to the microphone.",
    );
  }

  return parseClassicalMetadata(data.result);
}

interface AuddResult {
  artist: string;
  title: string;
  album?: string;
  release_date?: string;
  label?: string;
  apple_music?: {
    composerName?: string;
    artistName?: string;
    name?: string;
    albumName?: string;
    genreNames?: string[];
  };
  musicbrainz?: Array<{
    id: string;
    title: string;
    "artist-credit"?: Array<{
      name: string;
      artist: { id: string; name: string };
    }>;
  }>;
}

function matchComposerFromSeed(text: string) {
  const lower = text.toLowerCase();
  for (const c of composers) {
    const lastName = c.name.split(" ").pop()!.toLowerCase();
    if (lower.includes(lastName)) {
      return c;
    }
  }
  return undefined;
}

async function lookupComposerFromMusicBrainz(
  title: string,
): Promise<string | undefined> {
  const query = encodeURIComponent(`"${title}"`);

  const recordingUrl = `${MUSICBRAINZ_API_URL}/recording/?query=${query}&fmt=json&limit=100`;
  try {
    const res = await fetch(recordingUrl, {
      headers: { "User-Agent": "ClassicalMusicApp/0.1 (https://github.com)" },
    });
    if (!res.ok) return undefined;

    const data = await res.json();
    const recordings = data.recordings as Array<{
      title: string;
      "artist-credit"?: Array<{ artist: { name: string } }>;
    }>;

    if (recordings?.length) {
      const counts = new Map<string, number>();
      for (const rec of recordings) {
        const credits = rec["artist-credit"]?.map((c) => c.artist.name).join(" ") ?? "";
        const combined = `${rec.title} ${credits}`.toLowerCase();
        for (const c of composers) {
          const lastName = c.name.split(" ").pop()!.toLowerCase();
          if (combined.includes(lastName)) {
            counts.set(c.name, (counts.get(c.name) || 0) + 1);
          }
        }
      }

      if (counts.size > 0) {
        let best = "";
        let bestCount = 0;
        for (const [name, count] of counts) {
          if (count > bestCount) {
            best = name;
            bestCount = count;
          }
        }
        return best;
      }
    }
  } catch {}

  const workUrl = `${MUSICBRAINZ_API_URL}/work/?query=${query}&fmt=json&limit=10`;
  try {
    const res = await fetch(workUrl, {
      headers: { "User-Agent": "ClassicalMusicApp/0.1 (https://github.com)" },
    });
    if (!res.ok) return undefined;

    const data = await res.json();
    const works = data.works as Array<{
      title: string;
      relations?: Array<{
        type: string;
        artist: { name: string; "sort-name"?: string };
      }>;
    }>;

    if (!works?.length) return undefined;

    for (const work of works) {
      const composerRels = work.relations?.filter((r) => r.type === "composer");
      if (!composerRels?.length) continue;

      for (const rel of composerRels) {
        const sortName = (rel.artist["sort-name"] || rel.artist.name).toLowerCase();
        const match = composers.find((c) => {
          const lastName = c.name.split(" ").pop()!.toLowerCase();
          return sortName.includes(lastName);
        });
        if (match) return match.name;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

async function parseClassicalMetadata(result: AuddResult): Promise<RecognitionResult> {
  const title = result.title || "Unknown";
  const artist = result.artist || "Unknown Artist";
  const album = result.album || undefined;

  let composerName: string | undefined;
  let pieceName: string | undefined;
  let era: MusicEra | undefined;

  const appleComposer = result.apple_music?.composerName;

  if (appleComposer) {
    const matched = matchComposerFromSeed(appleComposer);
    if (matched) {
      composerName = matched.name;
      era = matched.era;
      pieceName = title;
    } else {
      composerName = appleComposer;
      pieceName = title;
    }
  }

  if (!composerName) {
    const colonIdx = title.indexOf(":");
    if (colonIdx > 0) {
      const beforeColon = title.substring(0, colonIdx).trim();
      const matched = matchComposerFromSeed(beforeColon);
      if (matched) {
        composerName = matched.name;
        era = matched.era;
        pieceName = title.substring(colonIdx + 1).trim();
      }
    }
  }

  if (!composerName) {
    const mbArtists = result.musicbrainz
      ?.flatMap((mb) => mb["artist-credit"]?.map((a) => a.artist.name) ?? [])
      .join(" ") ?? "";
    const searchable = `${title} ${artist} ${album ?? ""} ${mbArtists}`.toLowerCase();
    const matched = matchComposerFromSeed(searchable);
    if (matched) {
      composerName = matched.name;
      era = matched.era;
      pieceName = title
        .replace(new RegExp(matched.name, "gi"), "")
        .replace(new RegExp(matched.name.split(" ").pop()!, "gi"), "")
        .replace(/^[\s\-:]+/, "")
        .trim() || title;
    }
  }

  if (!composerName) {
    const mbComposer = await lookupComposerFromMusicBrainz(title);
    if (mbComposer) {
      const matched = composers.find((c) => c.name === mbComposer);
      if (matched) {
        composerName = matched.name;
        era = matched.era;
      } else {
        composerName = mbComposer;
      }
      pieceName = title;
    }
  }

  if (!composerName) {
    composerName = artist;
    pieceName = title;
  }

  return {
    title,
    artist,
    album,
    composerName,
    pieceName,
    era,
  };
}
