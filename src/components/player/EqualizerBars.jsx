export function EqualizerBars({ isPlaying = true, className = '' }) {
  if (!isPlaying) {
    return (
      <div className={`flex items-end gap-1 h-5 ${className}`}>
        <div className="w-1 bg-primary/40 h-2 rounded-full" />
        <div className="w-1 bg-primary/40 h-3 rounded-full" />
        <div className="w-1 bg-primary/40 h-2 rounded-full" />
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-1 h-5 ${className}`} aria-label="Audio equalizer animation">
      <div className="w-1 bg-primary animate-music-bar-1 h-3 rounded-full" />
      <div className="w-1 bg-primary animate-music-bar-2 h-4 rounded-full" />
      <div className="w-1 bg-primary animate-music-bar-3 h-3.5 rounded-full" />
    </div>
  );
}
