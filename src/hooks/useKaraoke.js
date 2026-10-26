import { useState, useEffect } from 'react';
import { getSyncedLyrics } from '../services/lyricsService';

/**
 * Custom hook to manage karaoke mode state, fetching synced lyrics,
 * polling YouTube player playback time, and line-seeking.
 *
 * @param {object} currentSong
 * @param {object} player - YouTube player API instance
 */
export function useKaraoke(currentSong, player) {
  const [showKaraoke, setShowKaraoke] = useState(false);
  const [lyricsData, setLyricsData] = useState({ lines: [], plainLyrics: null });
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [offset, setOffset] = useState(0);

  // Fetch synced lyrics whenever the song changes or when karaoke is opened
  useEffect(() => {
    if (!showKaraoke || !currentSong?.title) return;

    let isMounted = true;
    setIsLoading(true);

    getSyncedLyrics(currentSong.title, currentSong.artist)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.lines && data.lines.length > 0) {
          setLyricsData({
            lines: data.lines,
            plainLyrics: data.plainLyrics || currentSong.lyrics || null,
          });
        } else {
          setLyricsData({
            lines: [],
            plainLyrics: data?.plainLyrics || currentSong.lyrics || null,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setLyricsData({
            lines: [],
            plainLyrics: currentSong.lyrics || null,
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentSong?.title, currentSong?.artist, currentSong?.lyrics, showKaraoke]);

  // High-frequency polling (150ms) to synchronize with active playback time
  useEffect(() => {
    if (!showKaraoke || !player) return;

    const timer = setInterval(() => {
      try {
        if (typeof player.getCurrentTime === 'function') {
          const time = player.getCurrentTime();
          if (typeof time === 'number' && !isNaN(time)) {
            setCurrentTime(time);
          }
        }
      } catch {
        // Player may be unmounting or transitioning videos
      }
    }, 150);

    return () => clearInterval(timer);
  }, [showKaraoke, player]);

  // Interactive seek: clicking any lyric line jumps video to that timestamp
  const handleSeek = (seconds) => {
    if (player && typeof player.seekTo === 'function') {
      player.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  };

  return {
    showKaraoke,
    setShowKaraoke,
    toggleKaraoke: () => setShowKaraoke((prev) => !prev),
    lines: lyricsData.lines,
    plainLyrics: lyricsData.plainLyrics,
    isLoading,
    currentTime,
    offset,
    setOffset,
    handleSeek,
  };
}
