export function Button({
  children,
  variant = 'primary',   // 'primary' | 'secondary' | 'ghost'
  disabled = false,
  loading = false,
  fullWidth = true,
  onClick,
  type = 'button',
  style,
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    padding: '14px',
    fontSize: 'var(--fs-body)',
    fontFamily: 'var(--font-base)',
    fontWeight: 'var(--fw-regular)',
    border: 'none',
    borderRadius: 'var(--radius-btn)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'opacity var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out)',
    WebkitTapHighlightColor: 'transparent',
  };

  const variants = {
    primary:   { background: 'var(--accent)', color: 'var(--accent-text)' },
    secondary: { background: 'var(--surface-chip)', color: 'var(--text-primary)' },
    ghost:     { background: 'transparent', color: 'var(--accent)' },
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {loading && <Spinner />}
      {loading ? 'Отправляю…' : children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '14px',
        height: '14px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'ryzh-spin 0.7s linear infinite',
      }}
    />
  );
}
