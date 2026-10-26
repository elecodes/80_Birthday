/**
 * LRC (Lyrics) Parser & Synchronized Lyrics Service
 * Connects to LRCLIB to fetch time-coded lyrics without altering playlist data.
 */

const LRCLIB_BASE_URL = 'https://lrclib.net/api';
const lyricsCache = new Map();

/**
 * Parses raw LRC formatted text into an array of timed lyric objects.
 * Handles single or multiple timestamps per line: [mm:ss.xx] Text
 *
 * @param {string} lrcString
 * @returns {Array<{ time: number, text: string }>}
 */
export function parseLrc(lrcString) {
  if (!lrcString || typeof lrcString !== 'string') return [];

  const lines = lrcString.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const matches = [...trimmed.matchAll(timeRegex)];
    if (matches.length === 0) continue;

    // Everything after the last timestamp is the lyric text
    const lastMatch = matches[matches.length - 1];
    const textStartIndex = lastMatch.index + lastMatch[0].length;
    const text = trimmed.slice(textStartIndex).trim();

    for (const match of matches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fraction = match[3] ? parseFloat(`0.${match[3]}`) : 0;
      const time = minutes * 60 + seconds + fraction;

      result.push({ time, text });
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

/**
 * Sanitizes title and artist strings to improve API matching.
 * Removes common noisy suffixes like (Audio), (Remastered), [Official Video], etc.
 *
 * @param {string} str
 * @returns {string}
 */
function cleanSearchQuery(str) {
  if (!str) return '';
  return str
    .replace(/\s*[\(\[](official\s*(music\s*)?video|audio|remaster(ed)?|live|versi[oó]n.*)[\)\]]/gi, '')
    .trim();
}

/**
 * Fetches time-synced lyrics for a given song.
 *
 * @param {string} title
 * @param {string} artist
 * @returns {Promise<{ lines: Array<{ time: number, text: string }>, plainLyrics: string | null } | null>}
 */
export async function getSyncedLyrics(title, artist) {
  const cacheKey = `${artist} - ${title}`.toLowerCase();
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey);
  }

  const cleanedTitle = cleanSearchQuery(title);
  const cleanedArtist = cleanSearchQuery(artist);

  try {
    // 1. Direct match attempt
    const directUrl = `${LRCLIB_BASE_URL}/get?track_name=${encodeURIComponent(cleanedTitle)}&artist_name=${encodeURIComponent(cleanedArtist)}`;
    const directRes = await fetch(directUrl);

    if (directRes.ok) {
      const data = await directRes.json();
      if (data.syncedLyrics) {
        const parsed = {
          lines: parseLrc(data.syncedLyrics),
          plainLyrics: data.plainLyrics || null,
        };
        lyricsCache.set(cacheKey, parsed);
        return parsed;
      }
    }

    // 2. Fuzzy search fallback if exact match wasn't found or lacked synced lyrics
    const searchUrl = `${LRCLIB_BASE_URL}/search?q=${encodeURIComponent(`${cleanedTitle} ${cleanedArtist}`)}`;
    const searchRes = await fetch(searchUrl);

    if (searchRes.ok) {
      const results = await searchRes.json();
      const matchWithSync = results.find((r) => Boolean(r.syncedLyrics));

      if (matchWithSync) {
        const parsed = {
          lines: parseLrc(matchWithSync.syncedLyrics),
          plainLyrics: matchWithSync.plainLyrics || null,
        };
        lyricsCache.set(cacheKey, parsed);
        return parsed;
      }
    }

    // Cache null to avoid hammering the endpoint for unavailable tracks
    lyricsCache.set(cacheKey, null);
    return null;
  } catch (err) {
    console.warn(`[lyricsService] Failed to load lyrics for "${title}":`, err.message);
    return null;
  }
}
