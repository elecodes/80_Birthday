import { MOODS, MOOD_TAGS } from '../../moods';

export function MoodFilterSection({
  playlist,
  selectedMoods,
  onToggleMood,
  onSmartShuffle,
  onShuffleAll,
  onClose,
}) {
  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8 mb-8 border border-white/60 shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-top-4 select-none">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-foreground uppercase tracking-wide">
            ¿Qué mood querés?
          </h3>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
            Elegí 1 o 2 moods para personalizar el orden de reproducción
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-black px-3 py-1 bg-primary/10 text-primary rounded-full">
            {selectedMoods.length}/2 elegidos
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl glass-card text-muted-foreground hover:text-destructive flex items-center justify-center transition-all"
              title="Cerrar selección de mood"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {MOODS.map((m) => {
          const isSelected = selectedMoods.includes(m.id);
          const matchCount = playlist.filter((s) =>
            s.tags?.some((t) => (MOOD_TAGS[m.id] || []).includes(t))
          ).length;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onToggleMood(m.id)}
              className={`px-5 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2.5 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-md glow-primary scale-105'
                  : 'glass-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span>{m.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {matchCount}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => onSmartShuffle(selectedMoods)}
          disabled={selectedMoods.length === 0}
          className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 text-[11px] ${
            selectedMoods.length > 0
              ? 'bg-primary text-primary-foreground shadow-md glow-primary hover:bg-primary/90'
              : 'bg-muted/40 text-muted-foreground/50 cursor-not-allowed border border-border/50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Mezclar {selectedMoods.map((id) => MOODS.find((m) => m.id === id)?.emoji).join(' ')}
        </button>

        <button
          type="button"
          onClick={onShuffleAll}
          className="flex-1 py-4 rounded-2xl border border-border glass-card text-foreground font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-95 text-[11px]"
        >
          Mezclar Todo
        </button>
      </div>
    </section>
  );
}
