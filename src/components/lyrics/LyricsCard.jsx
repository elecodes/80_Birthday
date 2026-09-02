import { useState } from 'react';

export function LyricsCard({ lyrics, songTitle, artist, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!lyrics) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient subtle background */}
        <div className="ambient-bg-glow w-48 h-48 bg-accent/20 -top-10 -right-10 pointer-events-none" />

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center text-lg">
              📜
            </span>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                Letra de la Canción
              </h4>
              <p className="text-xs text-muted-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
                {songTitle} {artist && `· ${artist}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl glass-card text-muted-foreground hover:text-foreground text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
              title="Copiar letra al portapapeles"
            >
              {copied ? (
                <>
                  <span className="text-emerald-500">✓</span> Copiado
                </>
              ) : (
                <>
                  <span>📋</span> Copiar
                </>
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl glass-card text-muted-foreground hover:text-destructive flex items-center justify-center transition-all active:scale-95"
                title="Cerrar letra"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="max-h-64 sm:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line text-base sm:text-lg font-medium font-sans text-center">
            {lyrics}
          </p>
        </div>
      </div>
    </div>
  );
}
