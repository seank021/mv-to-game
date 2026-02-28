/**
 * Extract YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export interface VideoMetadata {
  title: string;
  author: string;
  thumbnail: string;
}

/**
 * Fetch video metadata via noembed.com (free, no API key, no CORS issues).
 */
export async function getVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const res = await fetch(
    `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
  );
  if (!res.ok) throw new Error("Failed to fetch video metadata");
  const data = await res.json();
  return {
    title: data.title ?? "Unknown",
    author: data.author_name ?? "Unknown",
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}
