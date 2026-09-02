export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  title,
  ariaLabel,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const variants = {
    primary:
      'bg-primary text-primary-foreground shadow-md glow-primary hover:bg-primary/90 hover:shadow-lg border border-transparent',
    secondary:
      'bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/90 border border-transparent',
    glass:
      'glass-card text-foreground border-border/80 hover:border-primary/50 hover:text-primary shadow-sm hover:shadow-md',
    outline:
      'border border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground',
    ghost:
      'text-muted-foreground hover:text-foreground hover:bg-muted/30',
    destructive:
      'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-destructive-foreground',
  };

  const sizes = {
    sm: 'px-3 py-1.5 rounded-xl text-[10px]',
    md: 'px-5 py-3 rounded-2xl text-xs',
    lg: 'px-7 py-4 rounded-2xl text-sm',
    icon: 'w-12 h-12 rounded-2xl text-base p-0',
    iconLg: 'w-14 h-14 rounded-2xl text-lg p-0',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
