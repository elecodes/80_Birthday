export const initialPlaylist = [
  {
    id: 1,
    title: "Feliz Cumpleaños",
    artist: "Las Mananitas",
    youtubeUrl: "https://www.youtube.com/watch?v=PnRrfF12qs0",
    youtubeId: "PnRrfF12qs0",
    lyrics: `Muy felices te queremos
con amor y alegría
que cumplas muchos años más
en tu día
Feliz cumpleaños Mamita`,
  },
  {
    id: 2,
    title: "Cielito Lindo",
    artist: "Jorge A. Marrón",
    youtubeUrl: "https://www.youtube.com/watch?v=6hHPfA73_jg",
    youtubeId: "6hHPfA73_jg",
    lyrics: `Cielito lindo, cielito lindo
de mi corazón
Cielito lindo, cielito lindo
que tienes alma de luz
Ay, ay, ay, ay
Canta y no llores
porque cantas feliz
como un cielo se ve`,
  },
  {
    id: 3,
    title: "Bailable",
    artist: "Jesse & Joy",
    youtubeUrl: "https://www.youtube.com/watch?v=JF-gf7fMt-k",
    youtubeId: "JF-gf7fMt-k",
    lyrics: null,
  },
  {
    id: 4,
    title: "Me Voy",
    artist: "Jesse & Joy",
    youtubeUrl: "https://www.youtube.com/watch?v=6tD2TYG8jFw",
    youtubeId: "6tD2TYG8jFw",
    lyrics: null,
  },
  {
    id: 5,
    title: "¡Viva La Vida!",
    artist: "Coldplay",
    youtubeUrl: "https://www.youtube.com/watch?v=2uGvFaqFJ3w",
    youtubeId: "2uGvFaqFJ3w",
    lyrics: null,
  },
  {
    id: 6,
    title: "Happy Birthday",
    artist: "Stevie Wonder",
    youtubeUrl: "https://www.youtube.com/watch?v=fJ9rUz0OcEo",
    youtubeId: "fJ9rUz0OcEo",
    lyrics: null,
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