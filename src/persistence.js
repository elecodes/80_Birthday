import { MOOD_TAGS } from './moods.js';

const STORAGE_KEYS = {
  CUSTOM_SONGS: 'birthday_custom_songs_v1',
  DELETED_IDS: 'birthday_deleted_ids_v1',
};

/**
 * Compact URL-safe Base64 encoder for custom songs.
 */
export function encodeCustomSongsToParam(customSongs) {
  if (!customSongs || customSongs.length === 0) return '';
  const compact = customSongs.map((s) => ({
    i: s.id,
    t: s.title,
    a: s.artist,
    y: s.youtubeId,
    m: s.tags?.find((tag) => tag !== 'user-added' && MOOD_TAGS[tag]) || s.mood || 'happy',
    l: s.lyrics || '',
  }));

  try {
    const json = JSON.stringify(compact);
    const utf8Bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (err) {
    console.error('Failed to encode custom songs for URL parameter:', err);
    return '';
  }
}

/**
 * Decode custom songs from URL parameter string.
 */
export function decodeCustomSongsFromParam(paramStr) {
  if (!paramStr) return [];
  try {
    let base64 = paramStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => {
      const mood = item.m || 'happy';
      return {
        id: item.i || Date.now(),
        title: item.t,
        artist: item.a,
        youtubeUrl: `https://www.youtube.com/watch?v=${item.y}`,
        youtubeId: item.y,
        lyrics: item.l || null,
        mood,
        tags: ['user-added', mood, ...(MOOD_TAGS[mood] || [])],
      };
    });
  } catch (err) {
    console.warn('Failed to decode custom songs from URL parameter:', err);
    return [];
  }
}

/**
 * Loads the initial playlist state combining:
 * 1. Base curated initialPlaylist
 * 2. Custom songs from URL parameter (?custom=)
 * 3. Custom songs from localStorage
 * 4. Deleted song IDs from localStorage
 */
export function loadPersistedPlaylist(initialPlaylist) {
  let urlCustomSongs = [];
  try {
    const params = new URLSearchParams(window.location.search);
    const customParam = params.get('custom');
    if (customParam) {
      urlCustomSongs = decodeCustomSongsFromParam(customParam);
    }
  } catch (err) {
    console.warn('Could not read URL parameters:', err);
  }

  let localCustomSongs = [];
  let deletedIds = [];
  try {
    const savedCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_SONGS);
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      if (Array.isArray(parsed)) localCustomSongs = parsed;
    }
    const savedDeleted = localStorage.getItem(STORAGE_KEYS.DELETED_IDS);
    if (savedDeleted) {
      const parsed = JSON.parse(savedDeleted);
      if (Array.isArray(parsed)) deletedIds = parsed;
    }
  } catch (err) {
    console.warn('Could not read localStorage:', err);
  }

  // Merge custom songs: URL songs take precedence, union with localStorage by ID/youtubeId
  const customMap = new Map();
  for (const song of localCustomSongs) {
    if (song?.youtubeId) customMap.set(song.youtubeId, song);
  }
  for (const song of urlCustomSongs) {
    if (song?.youtubeId) customMap.set(song.youtubeId, song);
  }
  const mergedCustom = Array.from(customMap.values());

  // Save merged state back to localStorage
  try {
    if (mergedCustom.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SONGS, JSON.stringify(mergedCustom));
    }
  } catch (err) {
    console.warn('Could not sync merged custom songs to localStorage:', err);
  }

  const deletedSet = new Set(deletedIds);
  const activeBase = initialPlaylist.filter((song) => !deletedSet.has(song.id));

  // If URL had custom songs but URL query string didn't have all merged ones, sync URL
  if (mergedCustom.length > 0) {
    try {
      const currentParam = new URLSearchParams(window.location.search).get('custom');
      const encodedMerged = encodeCustomSongsToParam(mergedCustom);
      if (currentParam !== encodedMerged) {
        const url = new URL(window.location.href);
        url.searchParams.set('custom', encodedMerged);
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // Safe fallback in non-standard environments
    }
  }

  return [...activeBase, ...mergedCustom];
}

/**
 * Synchronize playlist modifications to both localStorage and the URL.
 */
export function syncPlaylistToStorageAndUrl(currentPlaylist, initialPlaylist) {
  try {
    const initialIdSet = new Set(initialPlaylist.map((s) => s.id));
    const currentIdSet = new Set(currentPlaylist.map((s) => s.id));

    // Custom songs are those whose ID was not in initialPlaylist
    const customSongs = currentPlaylist.filter(
      (song) => !initialIdSet.has(song.id)
    );

    // Deleted songs are initial songs that no longer exist in currentPlaylist
    const deletedIds = initialPlaylist
      .filter((song) => !currentIdSet.has(song.id))
      .map((song) => song.id);

    // 1. Sync to localStorage
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SONGS, JSON.stringify(customSongs));
    localStorage.setItem(STORAGE_KEYS.DELETED_IDS, JSON.stringify(deletedIds));

    // 2. Sync to URL search parameters
    const url = new URL(window.location.href);
    if (customSongs.length > 0) {
      const encoded = encodeCustomSongsToParam(customSongs);
      url.searchParams.set('custom', encoded);
    } else {
      url.searchParams.delete('custom');
    }
    window.history.replaceState({}, '', url.toString());
  } catch (err) {
    console.warn('Failed to sync playlist to storage and URL:', err);
  }
}

/**
 * Reset all persistence: removes custom songs and deleted IDs from localStorage & URL.
 */
export function resetPersistence() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_SONGS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_IDS);

    const url = new URL(window.location.href);
    url.searchParams.delete('custom');
    window.history.replaceState({}, '', url.toString());
  } catch (err) {
    console.warn('Failed to reset persistence:', err);
  }
}
