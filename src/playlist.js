export const initialPlaylist = [
  {
    id: 1,
    title: "Feliz Cumpleaños",
    artist: "Las Mananitas",
    youtubeUrl: "https://www.youtube.com/watch?v=PnRrfF12qs0",
    youtubeId: "PnRrfF12qs0",
  },
  {
    id: 2,
    title: "Cielito Lindo",
    artist: "Jorge A. Marrón",
    youtubeUrl: "https://www.youtube.com/watch?v=6hHPfA73_jg",
    youtubeId: "6hHPfA73_jg",
  },
  {
    id: 3,
    title: "Bailable",
    artist: "Jesse & Joy",
    youtubeUrl: "https://www.youtube.com/watch?v=JF-gf7fMt-k",
    youtubeId: "JF-gf7fMt-k",
  },
  {
    id: 4,
    title: "Me Voy",
    artist: "Jesse & Joy",
    youtubeUrl: "https://www.youtube.com/watch?v=6tD2TYG8jFw",
    youtubeId: "6tD2TYG8jFw",
  },
  {
    id: 5,
    title: "¡Viva La Vida!",
    artist: "Coldplay",
    youtubeUrl: "https://www.youtube.com/watch?v=2uGvFaqFJ3w",
    youtubeId: "2uGvFaqFJ3w",
  },
  {
    id: 6,
    title: "Happy Birthday",
    artist: "Stevie Wonder",
    youtubeUrl: "https://www.youtube.com/watch?v=fJ9rUz0OcEo",
    youtubeId: "fJ9rUz0OcEo",
  },
];

export function getYoutubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
}

export function extractYoutubeId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}