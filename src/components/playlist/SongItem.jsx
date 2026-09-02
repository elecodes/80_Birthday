import { EqualizerBars } from '../player/EqualizerBars';
import { MOODS, getSongMood } from '../../moods';

export function SongItem({
  song,
  actualIndex,
  isActive,
  isMoodMatch,
  activeMoodEmojis = [],
  isRestricted,
  onSelect,
  onDelete,
}) {
  const songMood = getSongMood(song);
  const moodInfo = MOODS.find((m) => m.id === songMood) || MOODS[0];

  return (
    <div
      onClick={onSelect}
      className={`w-full text-left px-5 sm:px-8 py-4 transition-all duration-300 flex items-center gap-3 sm:gap-5 group cursor-pointer relative select-none ${
        isActive
          ? 'bg-primary/10 shadow-inner'
          : isMoodMatch
          ? 'bg-gradient-to-r from-primary/10 via-white/50 to-white/30 hover:from-primary/15'
          : 'hover:bg-muted/40'
      }`}
    >
      {/* Mood match accent bar */}
      {isMoodMatch && (
        <div className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-primary shadow-sm" />
      )}

      {/* Index or Play icon */}
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 text-xs font-black transition-all duration-300 ${
          isActive
            ? 'bg-primary text-primary-foreground scale-105 shadow-md glow-primary'
            : 'bg-muted/40 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
        }`}
      >
        {isActive ? (
          <svg className="w-5 h-5 fill-current animate-pulse" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <span className="font-mono">{actualIndex + 1}</span>
        )}
      </div>

      {/* Title & Artist */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <h4
          className={`text-sm sm:text-base font-bold truncate transition-colors duration-200 ${
            isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
          }`}
        >
          {song.title}
        </h4>
        <p
          className={`text-xs font-medium truncate ${
            isActive ? 'text-primary/70' : 'text-muted-foreground'
          }`}
        >
          {song.artist}
        </p>
      </div>

      {/* Video Restriction Flag */}
      {isRestricted && (
        <div className="shrink-0 text-[10px] font-black text-destructive bg-destructive/10 px-2.5 py-1 rounded-full border border-destructive/20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-destructive rounded-full animate-ping" />
          RESTRINGIDA
        </div>
      )}

      {/* Active playing equalizer */}
      {isActive && (
        <div className="shrink-0 ml-auto flex items-center">
          <EqualizerBars isPlaying={true} />
        </div>
      )}

      {/* Inactive Song Mood Badge & Delete action */}
      {!isActive && (
        <div className="shrink-0 flex items-center gap-2 sm:gap-3">
          {isMoodMatch && activeMoodEmojis.length > 0 ? (
            <span className="text-[10px] px-2.5 py-1 bg-secondary/15 text-secondary rounded-xl font-black border border-secondary/30 flex items-center gap-1 uppercase tracking-wider">
              <span>{activeMoodEmojis.join('')}</span>
              <span className="hidden sm:inline">MOOD</span>
            </span>
          ) : (
            <span className="text-[10px] px-2.5 py-1 bg-muted/40 text-muted-foreground rounded-xl font-black border border-border/60 flex items-center gap-1 uppercase tracking-wider transition-all group-hover:border-primary/40 group-hover:text-foreground">
              <span>{moodInfo.emoji}</span>
              <span className="hidden sm:inline">{moodInfo.label}</span>
            </span>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all rounded-xl opacity-0 group-hover:opacity-100"
              title="Eliminar canción"
              aria-label="Eliminar canción"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
