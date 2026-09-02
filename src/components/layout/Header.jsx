export function Header() {
  return (
    <header className="text-center mb-10 select-none">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-widest mb-4 shadow-sm backdrop-blur-md animate-soft-float">
        <span className="text-base">🎂</span> 80 Años de Mamá · Edición Especial
      </div>
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-sm">
        Felices 80
      </h1>
      <p className="mt-3 text-muted-foreground text-xs sm:text-sm md:text-base tracking-[0.25em] uppercase font-black opacity-90 flex items-center justify-center gap-3">
        <span className="w-8 sm:w-12 h-[2px] bg-gradient-to-r from-transparent to-primary/50 rounded-full inline-block" />
        La Música de Tu Vida
        <span className="w-8 sm:w-12 h-[2px] bg-gradient-to-l from-transparent to-primary/50 rounded-full inline-block" />
      </p>
    </header>
  );
}
