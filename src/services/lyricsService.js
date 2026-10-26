/**
 * LRC (Lyrics) Parser & Synchronized Lyrics Service
 * Connects to LRCLIB with normalization, local fallbacks for core songs,
 * and graceful fallback to plain lyrics when synced timestamps are unavailable.
 */

const LRCLIB_BASE_URL = 'https://lrclib.net/api';
const lyricsCache = new Map();

// Local synced lyrics catalog for high-priority songs (e.g., Birthday song)
// so they always work with zero network latency and no external failure.
const LOCAL_SYNCED_LYRICS = {
  'stevie wonder - happy birthday': `[00:33.22] You know it doesn't make much sense
[00:36.62] There ought to be a law against
[00:38.23] Anyone who takes offense
[00:40.97] At a day in your celebration
[00:46.33] 'Cause we all know in our minds
[00:49.32] That there ought to be a time
[00:52.20] That we can set aside
[00:54.67] To show just how much we love you
[00:59.85] And I'm sure you would agree
[01:03.02] What could fit more fittingly
[01:06.18] Than to have a world rejoice
[01:08.83] In with everything that you are
[01:13.43] Happy birthday to you
[01:17.02] Happy birthday to you
[01:20.52] Happy birthday
[01:27.42] Happy birthday to you
[01:31.02] Happy birthday to you
[01:34.50] Happy birthday
[01:41.87] I just never understood
[01:44.75] How a man who died for good
[01:48.01] Could not have a day that would
[01:50.81] Be set aside for his recognition
[01:55.72] Because it should never be
[01:58.74] Just because some cannot see
[02:01.89] The dream as clear as he
[02:04.58] That they should make it become an illusion
[02:09.68] And we all know everything
[02:12.72] That he stood for, time will bring
[02:15.82] For in peace, our hearts will sing
[02:18.52] Thanks to Martin Luther King
[02:23.23] Happy birthday to you
[02:26.75] Happy birthday to you
[02:30.22] Happy birthday
[02:37.15] Happy birthday to you
[02:40.67] Happy birthday to you
[02:44.20] Happy birthday`,
};

/**
 * Normalizes artist and title strings to repair known typographical quirks
 * in the dataset before querying online databases.
 */
function normalizeSongMetadata(title, artist) {
  let cleanTitle = (title || '').trim();
  let cleanArtist = (artist || '').trim();

  // Fix artist spelling/abbreviations
  if (/^m\s*dolores\s*pradera/i.test(cleanArtist)) {
    cleanArtist = 'María Dolores Pradera';
  } else if (/^el\s*duo\s*din[;'\´]amico/i.test(cleanArtist) || /^el\s*duo\s*dinamico/i.test(cleanArtist)) {
    cleanArtist = 'Dúo Dinámico';
  }

  // Fix known title typos
  cleanTitle = cleanTitle
    .replace(/^blowinn\s+(the\s+wind)/i, 'Blowing in $1')
    .replace(/^farewll\s+/i, 'Farewell ')
    .replace(/house\s+of\s+the\s+raising\s+sun/i, 'The House of the Rising Sun')
    .replace(/^delillah$/i, 'Delilah')
    .replace(/^molinedo\s+cafe$/i, 'Moliendo Café')
    .replace(/^lcuenca\s+de\s+los\s+poetas$/i, 'La cueca de los poetas')
    .replace(/\s*[\(\[](official\s*(music\s*)?video|audio|remaster(ed)?|live|versi[oó]n.*)[\)\]]/gi, '')
    .trim();

  return { cleanTitle, cleanArtist };
}

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

  // 1. Check local pre-bundled collection first
  if (LOCAL_SYNCED_LYRICS[cacheKey]) {
    const parsed = {
      lines: parseLrc(LOCAL_SYNCED_LYRICS[cacheKey]),
      plainLyrics: null,
    };
    lyricsCache.set(cacheKey, parsed);
    return parsed;
  }

  const { cleanTitle, cleanArtist } = normalizeSongMetadata(title, artist);
  const normalizedKey = `${cleanArtist} - ${cleanTitle}`.toLowerCase();
  if (LOCAL_SYNCED_LYRICS[normalizedKey]) {
    const parsed = {
      lines: parseLrc(LOCAL_SYNCED_LYRICS[normalizedKey]),
      plainLyrics: null,
    };
    lyricsCache.set(cacheKey, parsed);
    return parsed;
  }

  const headers = { 'User-Agent': 'BirthdayKaraokePlayer/1.0 (Family Tribute App)' };

  try {
    // 2. Query direct track & artist lookup
    const directUrl = `${LRCLIB_BASE_URL}/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
    const directRes = await fetch(directUrl, { headers });

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

      // If syncedLyrics is missing, keep plainLyrics as a fallback
      if (data.plainLyrics) {
        const parsed = {
          lines: [],
          plainLyrics: data.plainLyrics,
        };
        lyricsCache.set(cacheKey, parsed);
        return parsed;
      }
    }

    // 3. Fallback search by query (handles slight naming discrepancies)
    const searchUrl = `${LRCLIB_BASE_URL}/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`;
    const searchRes = await fetch(searchUrl, { headers });

    if (searchRes.ok) {
      const results = await searchRes.json();
      if (Array.isArray(results)) {
        const matchWithSync = results.find((r) => Boolean(r.syncedLyrics));
        if (matchWithSync) {
          const parsed = {
            lines: parseLrc(matchWithSync.syncedLyrics),
            plainLyrics: matchWithSync.plainLyrics || null,
          };
          lyricsCache.set(cacheKey, parsed);
          return parsed;
        }

        const matchWithPlain = results.find((r) => Boolean(r.plainLyrics));
        if (matchWithPlain) {
          const parsed = {
            lines: [],
            plainLyrics: matchWithPlain.plainLyrics,
          };
          lyricsCache.set(cacheKey, parsed);
          return parsed;
        }
      }
    }

    lyricsCache.set(cacheKey, null);
    return null;
  } catch (err) {
    console.warn(`[lyricsService] Failed to load lyrics for "${title}":`, err.message);
    return null;
  }
}
