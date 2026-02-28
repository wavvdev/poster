import axios from "axios";
import logger from "../logger/logger";

const YT_API_BASE = "https://www.googleapis.com/youtube/v3";
const SUGGEST_BASE = "https://suggestqueries.google.com/complete/search";

/**
 * Pull tags from top 50 trending music videos via YT Data API v3.
 * Costs 2 quota units per call (out of 10k free/day).
 */
export async function getTrendingMusicTags(
  apiKey: string,
  regionCode = "US",
  maxResults = 50,
): Promise<string[]> {
  logger.info("fetching trending music video IDs", { regionCode, maxResults });

  const trending = await axios.get(`${YT_API_BASE}/videos`, {
    params: {
      part: "id",
      chart: "mostPopular",
      videoCategoryId: 10,
      regionCode,
      maxResults,
      key: apiKey,
    },
  });

  const ids = trending.data.items.map((v: any) => v.id).join(",");
  if (!ids) return [];

  const details = await axios.get(`${YT_API_BASE}/videos`, {
    params: { part: "snippet", id: ids, key: apiKey },
  });

  const tags = details.data.items
    .flatMap((v: any) => v.snippet.tags || [])
    .map((t: string) => t.toLowerCase());

  const unique = [...new Set(tags)] as string[];
  logger.info("trending tags fetched", { count: unique.length });
  return unique;
}

/**
 * Get YouTube search suggestions for a keyword. No auth needed.
 */
export async function getYouTubeSuggestions(
  query: string,
): Promise<string[]> {
  const res = await axios.get(SUGGEST_BASE, {
    params: { client: "firefox", ds: "yt", q: query },
  });
  return res.data[1] || [];
}

/**
 * Get suggestions for multiple seed keywords with a delay between requests.
 */
export async function getBulkSuggestions(
  seeds: string[],
  delayMs = 500,
): Promise<string[]> {
  logger.info("fetching bulk suggestions", { seeds: seeds.length });
  const all: string[] = [];

  for (const seed of seeds) {
    const suggestions = await getYouTubeSuggestions(seed);
    all.push(...suggestions);
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }

  const unique = [...new Set(all.map((s) => s.toLowerCase()))];
  logger.info("bulk suggestions fetched", { count: unique.length });
  return unique;
}

/**
 * Combined: trending video tags + autocomplete suggestions, deduped.
 */
export async function getAllTags(
  apiKey: string,
  seeds: string[] = [
    "music 2026",
    "new music",
    "hip hop",
    "pop music",
    "lo-fi music",
    "rnb music",
    "indie music",
    "edm music",
    "chill music",
    "trending music",
  ],
  regionCode = "US",
): Promise<string[]> {
  const [trending, suggestions] = await Promise.all([
    getTrendingMusicTags(apiKey, regionCode),
    getBulkSuggestions(seeds),
  ]);

  const combined = [...new Set([...trending, ...suggestions])];
  logger.info("all tags combined", { count: combined.length });
  return combined;
}
