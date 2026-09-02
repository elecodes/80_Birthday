export function PlayerControls({
  onPrevious,
  onNext,
  onOpenShuffle,
  onOpenAddSong,
  hasLyrics,
  showLyrics,
  onToggleLyrics,
}) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-5 md:gap-6 mt-8 select-none">
      {/* Smart Shuffle Button */}
      <button
        type="button"
        onClick={onOpenShuffle}
        className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl glass-card text-muted-foreground flex items-center justify-center shadow-md hover:shadow-xl hover:scale-110 hover:text-primary hover:border-primary/50 transition-all duration-300 group active:scale-95"
        title="Mezclar por estado de ánimo"
        aria-label="Smart Shuffle"
      >
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>

      {/* Previous Song */}
      <button
        type="button"
        onClick={onPrevious}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-primary hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
        title="Canción anterior"
        aria-label="Previous song"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
        </svg>
      </button>

      {/* Next Song */}
      <button
        type="button"
        onClick={onNext}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-primary hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
        title="Siguiente canción"
        aria-label="Next song"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      {/* Lyrics Toggle (if current song has lyrics) */}
      {hasLyrics && (
        <button
          type="button"
          onClick={onToggleLyrics}
          className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-md active:scale-95 ${
            showLyrics
              ? 'bg-accent text-accent-foreground shadow-lg scale-105'
              : 'glass-card text-muted-foreground hover:text-accent hover:border-accent/50 hover:scale-110'
          }`}
          title={showLyrics ? 'Ocultar Letra' : 'Ver Letra'}
          aria-label="Toggle Lyrics"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      )}

      {/* Add Song Button */}
      <button
        type="button"
        onClick={onOpenAddSong}
        className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl glass-card text-muted-foreground flex items-center justify-center shadow-md hover:shadow-xl hover:scale-110 hover:text-primary hover:border-primary/50 transition-all duration-300 group active:scale-95"
        title="Agregar nueva canción"
        aria-label="Add Song"
      >
        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
}
