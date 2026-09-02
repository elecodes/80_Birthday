import { useState, useMemo } from 'react';
import { SongItem } from './SongItem';
import { Pagination } from './Pagination';

export function PlaylistDrawer({
  playlist,
  currentIndex,
  isOpen,
  onToggle,
  onSelectSong,
  onDeleteSong,
  moodMatchedIds = new Set(),
  activeMoodEmojis = [],
  onClearMoodFilter,
  songErrors = new Set(),
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('both'); // 'title', 'artist', 'both'
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Filter songs based on search
  const filteredPlaylist = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return playlist;

    return playlist.filter((song) => {
      const titleMatch = song.title?.toLowerCase().includes(term);
      const artistMatch = song.artist?.toLowerCase().includes(term);

      if (searchType === 'title') return titleMatch;
      if (searchType === 'artist') return artistMatch;
      return titleMatch || artistMatch;
    });
  }, [playlist, searchTerm, searchType]);

  const totalPages = Math.ceil(filteredPlaylist.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));
  const paginatedSongs = filteredPlaylist.slice(
    safePage * ITEMS_PER_PAGE,
    (safePage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="relative mb-12 select-none">
      {/* Drawer Toggle Header Button */}
      <button
        onClick={onToggle}
        className={`w-full p-6 md:p-8 rounded-3xl transition-all duration-500 flex items-center justify-between border group relative z-10 ${
          isOpen
            ? 'glass-panel border-primary shadow-xl glow-primary'
            : 'glass-panel border-white/60 hover:border-primary/50 shadow-md hover:shadow-xl'
        }`}
      >
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              isOpen
                ? 'bg-primary text-primary-foreground glow-primary scale-105'
                : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
            }`}
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-[0.25em] leading-none mb-1.5">
              Colección de Música
            </p>
            <div className="flex items-center gap-2.5">
              <p className="text-2xl sm:text-3xl font-black text-foreground leading-none font-mono">
                {playlist.length}
              </p>
              <span className="text-muted-foreground/70 text-xs font-bold tracking-wide">
                canciones cargadas
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span
            className={`hidden sm:inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-500 ${
              isOpen ? 'opacity-0' : 'bg-primary/10 text-primary border border-primary/20'
            }`}
          >
            Explorar
          </span>
          <div
            className={`w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-muted-foreground transition-transform duration-500 ${
              isOpen ? 'rotate-180 text-primary border-primary/50' : 'group-hover:translate-y-0.5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded Drawer Content */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-4 z-50 glass-panel rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Active Mood Filter Banner — sticky */}
          {moodMatchedIds.size > 0 && (
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-3.5 bg-primary text-primary-foreground shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xl">
                  {activeMoodEmojis.map((emoji, i) => (
                    <span key={i}>{emoji}</span>
                  ))}
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest opacity-95">
                  {moodMatchedIds.size} canciones · Mood Mix Activo
                </span>
              </div>
              {onClearMoodFilter && (
                <button
                  onClick={onClearMoodFilter}
                  className="text-[10px] font-black uppercase tracking-widest bg-primary-foreground/20 hover:bg-primary-foreground/30 px-3.5 py-1.5 rounded-xl transition-all"
                >
                  ✕ Limpiar
                </button>
              )}
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="p-5 sm:p-7 border-b border-border/60 bg-white/40">
            <div className="flex gap-2 mb-3.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSearchType('both')}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shrink-0 ${
                  searchType === 'both'
                    ? 'bg-primary text-primary-foreground shadow-sm glow-primary'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
                }`}
              >
                TODO
              </button>
              <button
                onClick={() => setSearchType('title')}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shrink-0 ${
                  searchType === 'title'
                    ? 'bg-primary text-primary-foreground shadow-sm glow-primary'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
                }`}
              >
                TÍTULO
              </button>
              <button
                onClick={() => setSearchType('artist')}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shrink-0 ${
                  searchType === 'artist'
                    ? 'bg-primary text-primary-foreground shadow-sm glow-primary'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
                }`}
              >
                ARTISTA
              </button>
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder={`Buscar ${
                  searchType === 'title'
                    ? 'por título'
                    : searchType === 'artist'
                    ? 'por artista'
                    : 'canción o artista'
                }...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="input-field pl-12 pr-12 text-sm sm:text-base"
              />
              <svg className="w-5 h-5 absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-3 p-1 rounded-xl hover:bg-muted/50 text-muted-foreground transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Paginated Song Items */}
          <div className="max-h-[460px] overflow-y-auto divide-y divide-border/40 custom-scrollbar">
            {filteredPlaylist.length > 0 ? (
              paginatedSongs.map((song) => {
                const actualIndex = playlist.findIndex((s) => s.id === song.id);
                const isActive = actualIndex === currentIndex;
                const isMoodMatch = moodMatchedIds.has(song.id);

                return (
                  <SongItem
                    key={song.id || actualIndex}
                    song={song}
                    actualIndex={actualIndex}
                    isActive={isActive}
                    isMoodMatch={isMoodMatch}
                    activeMoodEmojis={activeMoodEmojis}
                    isRestricted={songErrors.has(song.youtubeId)}
                    onSelect={() => onSelectSong(actualIndex)}
                    onDelete={
                      playlist.length > 1 ? () => onDeleteSong(actualIndex) : undefined
                    }
                  />
                );
              })
            ) : (
              <div className="py-16 text-center">
                <div className="w-14 h-14 bg-muted/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-muted-foreground font-bold text-sm">
                  No se encontraron canciones
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-primary font-black uppercase tracking-widest mt-2 hover:underline"
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
