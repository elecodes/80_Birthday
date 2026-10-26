import { useEffect, useRef } from 'react';

/**
 * KaraokeStage Component
 * Provides real-time synchronized scrolling lyrics with visual active line tracking,
 * offset calibration, and interactive line-seeking.
 */
export function KaraokeStage({
  lines = [],
  plainLyrics = null,
  currentTime = 0,
  isLoading = false,
  songTitle = '',
  artist = '',
  moodColor = 'var(--color-primary)',
  offset = 0,
  onOffsetChange,
  onSeek,
  onClose,
}) {
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  const effectiveTime = Math.max(0, currentTime + offset);

  // Identify the currently playing lyric line
  let activeIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (effectiveTime >= lines[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smooth scroll container to keep active line centered
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const hasSyncedLyrics = lines && lines.length > 0;

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl relative overflow-hidden">
        {/* Dynamic ambient backdrop glow */}
        <div
          className="ambient-bg-glow w-56 h-56 -top-12 -right-12 pointer-events-none transition-colors duration-700"
          style={{
            backgroundColor: moodColor,
            opacity: 0.2,
          }}
        />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm border border-white/40"
              style={{ backgroundColor: `${moodColor}20` }}
            >
              🎤
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Modo Karaoke
                </h4>
                {hasSyncedLyrics && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Sincronizado
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium truncate max-w-[220px] sm:max-w-xs">
                {songTitle} {artist && `· ${artist}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Sync Calibration Controls (only if synced lines exist) */}
            {hasSyncedLyrics && onOffsetChange && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl glass-card border border-border/60 text-[11px] font-bold">
                <span className="text-muted-foreground mr-1 text-[10px] uppercase tracking-wider">Sinc:</span>
                <button
                  onClick={() => onOffsetChange(Math.round((offset - 0.5) * 10) / 10)}
                  className="w-6 h-6 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-xs active:scale-95 transition-all"
                  title="Retrasar letra 0.5s"
                >
                  -
                </button>
                <button
                  onClick={() => onOffsetChange(0)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                    offset !== 0 ? 'text-primary font-black underline' : 'text-muted-foreground'
                  }`}
                  title="Reiniciar sincronización"
                >
                  {offset > 0 ? `+${offset}s` : `${offset}s`}
                </button>
                <button
                  onClick={() => onOffsetChange(Math.round((offset + 0.5) * 10) / 10)}
                  className="w-6 h-6 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-xs active:scale-95 transition-all"
                  title="Adelantar letra 0.5s"
                >
                  +
                </button>
              </div>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl glass-card text-muted-foreground hover:text-destructive flex items-center justify-center transition-all active:scale-95"
                title="Cerrar karaoke"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Main Lyrics Display Area */}
        <div
          ref={containerRef}
          className="max-h-72 sm:max-h-96 overflow-y-auto px-2 py-6 custom-scrollbar scroll-smooth space-y-4"
        >
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="inline-block animate-spin text-2xl">⏳</div>
              <p className="text-sm font-bold text-muted-foreground">
                Buscando letra sincronizada en tiempo real...
              </p>
            </div>
          ) : hasSyncedLyrics ? (
            lines.map((line, index) => {
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;

              return (
                <div
                  key={`${line.time}-${index}`}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek && onSeek(line.time)}
                  className={`text-center transition-all duration-300 cursor-pointer select-none px-4 py-2 rounded-2xl ${
                    isActive
                      ? 'scale-105 sm:scale-110 font-black text-lg sm:text-2xl shadow-lg border border-white/40'
                      : isPast
                        ? 'opacity-35 scale-95 font-medium text-sm sm:text-base text-foreground/80 hover:opacity-70'
                        : 'opacity-65 font-semibold text-base sm:text-lg text-foreground/90 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? `${moodColor}22` : 'transparent',
                    color: isActive ? moodColor : undefined,
                    textShadow: isActive ? `0 0 16px ${moodColor}40` : 'none',
                  }}
                  title="Haz clic para saltar a esta parte"
                >
                  {line.text || '♪'}
                </div>
              );
            })
          ) : plainLyrics ? (
            <div className="text-center py-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4">
                (Letra estática sin sincronizar)
              </p>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line text-base sm:text-lg font-medium font-sans">
                {plainLyrics}
              </p>
            </div>
          ) : (
            <div className="py-14 text-center space-y-2">
              <span className="text-3xl">🎶</span>
              <p className="text-sm font-bold text-foreground">
                No encontramos letra sincronizada para esta canción.
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Puedes seguir disfrutando la música de Mamá o usar tus canciones favoritas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
