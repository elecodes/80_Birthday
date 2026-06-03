// Mood configuration for the playlist mixer

export const MOODS = [
  { id: 'happy', emoji: '🎉', label: 'Happy', color: '#fbbf24' },
  { id: 'dance', emoji: '💃', label: 'Dance', color: '#f472b6' },
  { id: 'romantic', emoji: '💕', label: 'Romantic', color: '#f87171' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#60a5fa' },
  { id: 'energetic', emoji: '🌟', label: 'Energetic', color: '#fb923c' },
  { id: 'nostalgic', emoji: '🥹', label: 'Nostalgic', color: '#a78bfa' },
];

export const MOOD_TAGS = {
  happy: ['celebration', 'birthday', 'upbeat', 'happy'],
  dance: ['dance', 'upbeat', 'party'],
  romantic: ['romantic', 'ballad', 'slow'],
  calm: ['calm', 'slow', 'acoustic'],
  energetic: ['upbeat', 'energetic', 'fast'],
  nostalgic: ['nostalgic', 'retro', 'classic'],
};

export function getSongMood(song) {
  const tags = song.tags || [];
  for (const [mood, moodTags] of Object.entries(MOOD_TAGS)) {
    if (moodTags.some(t => tags.includes(t))) return mood;
  }
  return 'happy';
}