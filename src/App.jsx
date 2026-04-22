import { useState, useRef } from 'react';
import { playlist, getYoutubeEmbedUrl } from './playlist';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const playerRef = useRef(null);

  const currentSong = playlist[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === playlist.length - 1 ? 0 : prev + 1));
  };

  const handleSongClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-rose-50 to-gold-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-rose-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Felices
          </h1>
          <p className="mt-2 text-rose-700/70 text-sm md:text-base font-body">
            Playlist de Cumpleaños
          </p>
        </header>

        <section className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl shadow-rose-100/50 p-4 md:p-6 mb-8">
          <div className="aspect-video rounded-2xl overflow-hidden bg-rose-900/5">
            <iframe
              key={currentIndex}
              ref={playerRef}
              className="w-full h-full"
              src={getYoutubeEmbedUrl(currentSong.youtubeId)}
              title={currentSong.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="text-center mt-6">
            <h2 className="text-2xl md:text-3xl font-medium text-rose-900 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {currentSong.title}
            </h2>
            <p className="mt-1 text-rose-700/60 text-base md:text-lg font-body">
              {currentSong.artist}
            </p>
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={goToPrevious}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-300/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-105 transition-all duration-300"
              aria-label="Previous song"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-300/50 hover:shadow-xl hover:shadow-rose-300/60 hover:scale-105 transition-all duration-300"
              aria-label="Next song"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
        </section>

        <section className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-inner shadow-rose-100/30 p-4">
          <ul className="space-y-2">
            {playlist.map((song, index) => (
              <li key={song.id}>
                <button
                  onClick={() => handleSongClick(index)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-gradient-to-r from-rose-400/20 to-gold-400/20 border border-rose-200/50 scale-[1.02]'
                      : 'hover:bg-white/50 hover:scale-[1.01] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-medium w-6 ${
                        index === currentIndex ? 'text-rose-500' : 'text-rose-300'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-body truncate ${
                          index === currentIndex
                            ? 'text-rose-900 font-medium'
                            : 'text-rose-800/70'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p
                        className={`text-sm truncate ${
                          index === currentIndex
                            ? 'text-rose-600'
                            : 'text-rose-600/60'
                        }`}
                      >
                        {song.artist}
                      </p>
                    </div>
                    {index === currentIndex && (
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-8 text-center text-rose-700/50 text-sm">
          <p className="font-body">con ❤️ para Mam</p>
        </footer>
      </div>
    </div>
  );
}

export default App;