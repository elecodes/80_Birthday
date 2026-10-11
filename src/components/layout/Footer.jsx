import { useState } from 'react';

export function Footer({ onExportJson, onResetPlaylist }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    try {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy link:', err);
    }
  };

  return (
    <footer className="mt-14 text-center text-muted-foreground text-xs space-y-4 select-none">
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 rounded-xl glass-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-all font-black text-[11px] uppercase tracking-wider active:scale-95 shadow-sm hover:shadow flex items-center gap-1.5"
          title="Copiar enlace con canciones guardadas"
        >
          <span>{copied ? '✓' : '🔗'}</span>
          <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
        </button>
        <button
          onClick={onExportJson}
          className="px-4 py-2 rounded-xl glass-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all font-black text-[11px] uppercase tracking-wider active:scale-95 shadow-sm hover:shadow"
        >
          Exportar JSON
        </button>
        <button
          onClick={onResetPlaylist}
          className="px-4 py-2 rounded-xl glass-card text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all font-black text-[11px] uppercase tracking-wider active:scale-95 shadow-sm hover:shadow"
        >
          Restablecer
        </button>
      </div>
      <p className="font-bold opacity-80 pt-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm">
        con <span className="text-primary text-base inline-block animate-pulse">❤️</span> para Mamá en sus 80 años
      </p>
    </footer>
  );
}
