import { useState, useEffect } from 'react';
import { initialPlaylist, getYoutubeEmbedUrl, extractYoutubeId } from './playlist';

const STORAGE_KEY = 'birthday-playlist';

function App() {
  const [playlist, setPlaylist] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialPlaylist;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', artist: '', youtubeUrl: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist));
  }, [playlist]);

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

  const handleAddSong = (e) => {
    e.preventDefault();
    setError('');

    const youtubeId = extractYoutubeId(newSong.youtubeUrl);
    if (!youtubeId) {
      setError('Invalid YouTube URL. Use format: youtube.com/watch?v=xxx or youtu.be/xxx');
      return;
    }

    if (!newSong.title.trim() || !newSong.artist.trim()) {
      setError('Title and Artist are required');
      return;
    }

    const song = {
      id: Date.now(),
      title: newSong.title.trim(),
      artist: newSong.artist.trim(),
      youtubeUrl: newSong.youtubeUrl,
      youtubeId,
    };

    setPlaylist((prev) => [...prev, song]);
    setCurrentIndex(playlist.length);
    setNewSong({ title: '', artist: '', youtubeUrl: '' });
    setShowAddForm(false);
  };

  const handleDelete = (index, e) => {
    e.stopPropagation();
    if (playlist.length <= 1) return;

    const newPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(newPlaylist);

    if (currentIndex >= newPlaylist.length) {
      setCurrentIndex(newPlaylist.length - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-rose-50 to-gold-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-rose-900 tracking-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Felices
          </h1>
          <p className="mt-2 text-rose-700/70 text-sm md:text-base">
            Playlist de Cumpleaños
          </p>
        </header>

        <section className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl shadow-rose-100/50 p-4 md:p-6 mb-8">
          <div className="aspect-video rounded-2xl overflow-hidden bg-rose-900/5">
            <iframe
              key={currentIndex}
              className="w-full h-full"
              src={getYoutubeEmbedUrl(currentSong.youtubeId)}
              title={currentSong.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="text-center mt-6">
            <h2 className="text-2xl md:text-3xl font-medium text-rose-900 leading-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              {currentSong.title}
            </h2>
            <p className="mt-1 text-rose-700/60 text-base md:text-lg">
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

        {showAddForm && (
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-rose-100/50 p-4 md:p-6 mb-6">
            <h3 className="text-lg font-medium text-rose-900 mb-4" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Add New Song
            </h3>
            <form onSubmit={handleAddSong} className="space-y-4">
              <div>
                <input
                  type="url"
                  placeholder="YouTube URL"
                  value={newSong.youtubeUrl}
                  onChange={(e) => setNewSong({ ...newSong, youtubeUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white/80 text-rose-900 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newSong.title}
                  onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-rose-200 bg-white/80 text-rose-900 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Artist"
                  value={newSong.artist}
                  onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-rose-200 bg-white/80 text-rose-900 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
                />
              </div>
              {error && <p className="text-rose-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium hover:from-rose-500 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-rose-300/50"
                >
                  Add Song
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setError(''); }}
                  className="px-6 py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-inner shadow-rose-100/30 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-rose-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Playlist ({playlist.length})
            </h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-rose-500 hover:text-rose-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <ul className="space-y-2">
            {playlist.map((song, index) => (
              <li key={song.id}>
                <button
                  onClick={() => handleSongClick(index)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
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
                        className={`truncate ${
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
                    <button
                      onClick={(e) => handleDelete(index, e)}
                      className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-8 text-center text-rose-700/50 text-sm">
          <p>con ❤️ para Mam</p>
        </footer>
      </div>
    </div>
  );
}

export default App;