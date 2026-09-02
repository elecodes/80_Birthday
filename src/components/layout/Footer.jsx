export function Footer({ onExportJson, onResetPlaylist }) {
  return (
    <footer className="mt-14 text-center text-muted-foreground text-xs space-y-4 select-none">
      <div className="flex flex-wrap justify-center gap-3">
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
