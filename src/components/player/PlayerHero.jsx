import { useState } from 'react';
import { PlayerControls } from './PlayerControls';
import { EqualizerBars } from './EqualizerBars';
import { LyricsCard } from '../lyrics/LyricsCard';
import { MOODS, getSongMood } from '../../moods';

export function PlayerHero({
  currentSong,
  currentIndex,
  totalSongs,
  onPrevious,
  onNext,
  onOpenShuffle,
  onOpenAddSong,
  isRestricted = false,
}) {
  const [showLyrics, setShowLyrics] = useState(false);
  const songMood = getSongMood(currentSong);
  const moodData = MOODS.find((m) => m.id === songMood) || MOODS[0];

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8 md:p-10 mb-10 border border-white/80 shadow-2xl relative overflow-hidden select-none">
      {/* Dynamic ambient background glow that matches current song mood */}
      <div
        className="ambient-bg-glow w-96 h-96 -top-20 -right-20 pointer-events-none transition-colors duration-700"
        style={{
          backgroundColor: moodData?.color || 'var(--color-primary)',
          opacity: 0.15,
        }}
      />

      {/* Video Display Frame */}
      <div className="aspect-video rounded-2xl overflow-hidden bg-black/90 shadow-2xl border border-white/20 relative group">
        <div id="youtube-player" className="w-full h-full" />

        {isRestricted && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-3xl mb-2">⚠️</span>
            <p className="font-black text-destructive text-sm uppercase tracking-wider mb-1">
              Video con restricción de reproducción
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mb-4">
              Este video no permite ser reproducido en modo embebido. Saltando a la siguiente canción...
            </p>
            <button
              onClick={onNext}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider shadow-md"
            >
              Saltar Ahora →
            </button>
          </div>
        )}
      </div>

      {/* Song Metadata Card */}
      <div className="mt-8 text-center space-y-2">
        {/* Track counter pill + Mood badge + Live Equalizer */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/60">
            {currentIndex + 1} / {totalSongs}
          </span>

          <span
            className="text-[11px] font-black px-3.5 py-1 rounded-full border flex items-center gap-1.5 uppercase tracking-wider transition-all duration-500 shadow-sm"
            style={{
              backgroundColor: `${moodData?.color}15`,
              borderColor: `${moodData?.color}40`,
              color: moodData?.color,
            }}
          >
            <span className="text-sm">{moodData?.emoji}</span>
            <span>{moodData?.label}</span>
          </span>

          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5">
            <EqualizerBars isPlaying={true} />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">EN VIVO</span>
          </div>
        </div>

        {/* Title and Artist */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-snug pt-1">
          {currentSong?.title || 'Cargando...'}
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl font-semibold">
          {currentSong?.artist || ''}
        </p>
      </div>

      {/* Player Controls */}
      <PlayerControls
        onPrevious={onPrevious}
        onNext={onNext}
        onOpenShuffle={onOpenShuffle}
        onOpenAddSong={onOpenAddSong}
        hasLyrics={Boolean(currentSong?.lyrics)}
        showLyrics={showLyrics}
        onToggleLyrics={() => setShowLyrics(!showLyrics)}
      />

      {/* Embedded Lyrics (if open) */}
      {showLyrics && currentSong?.lyrics && (
        <LyricsCard
          lyrics={currentSong.lyrics}
          songTitle={currentSong.title}
          artist={currentSong.artist}
          onClose={() => setShowLyrics(false)}
        />
      )}
    </section>
  );
}
