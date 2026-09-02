export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    // If totalPages <= 7, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    // Otherwise show dynamic window around current page
    const pages = new Set([0, totalPages - 1]);
    for (let i = Math.max(0, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      pages.add(i);
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const pageList = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 bg-white/40 border-t border-border/60 select-none">
      <button
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
          currentPage === 0
            ? 'text-muted-foreground/30 cursor-not-allowed'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-95'
        }`}
      >
        ← Anterior
      </button>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {pageList.map((pageNum, idx) => {
          const prevPage = pageList[idx - 1];
          const hasGap = prevPage !== undefined && pageNum - prevPage > 1;

          return (
            <div key={pageNum} className="flex items-center gap-1.5">
              {hasGap && <span className="text-muted-foreground/40 text-xs px-1">...</span>}
              <button
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-black transition-all active:scale-95 ${
                  pageNum === currentPage
                    ? 'bg-primary text-primary-foreground shadow-sm glow-primary scale-105'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                {pageNum + 1}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage === totalPages - 1}
        className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
          currentPage === totalPages - 1
            ? 'text-muted-foreground/30 cursor-not-allowed'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-95'
        }`}
      >
        Siguiente →
      </button>
    </div>
  );
}
