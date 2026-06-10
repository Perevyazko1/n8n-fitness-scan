export function Chip({
  children,
  active = false,
  onClick,
  disabled = false,
  style,
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: '0 0 auto',
        width: 'auto',
        margin: 0,
        padding: '8px 14px',
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        fontSize: 'var(--fs-sub)',
        fontFamily: 'var(--font-base)',
        background: active ? 'var(--accent)' : 'var(--surface-card)',
        color: active ? 'var(--accent-text)' : 'var(--text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-base) var(--ease-out)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Wrapping flex row of chips. */
export function ChipRow({ children, style, ...rest }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', ...style }} {...rest}>
      {children}
    </div>
  );
}
