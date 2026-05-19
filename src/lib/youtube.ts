import { YouTubeVideo } from "@/types";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

async function searchWithOfficialApi(query: string): Promise<YouTubeVideo[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "8",
    videoCategoryId: "10",
    key: YOUTUBE_API_KEY,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) return [];

  const data = await res.json();

  return (data.items || []).map(
    (item: {
      id: { videoId: string };
      snippet: {
        title: string;
        thumbnails: { medium: { url: string } };
        channelTitle: string;
      };
    }) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
    }),
  );
}

export async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];
  return searchWithOfficialApi(query);
}
