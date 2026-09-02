export function Badge({ children, variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'bg-muted/40 text-muted-foreground border-border/60',
    primary: 'bg-primary/10 text-primary border-primary/20 shadow-sm',
    secondary: 'bg-secondary/15 text-secondary border-secondary/30',
    accent: 'bg-accent/15 text-accent border-accent/30',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border backdrop-blur-sm transition-all ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
