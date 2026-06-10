export function Card({
  children,
  as = 'div',
  padding = 16,
  style,
  ...rest
}) {
  const Tag = as;
  return (
    <Tag
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-card)',
        padding: typeof padding === 'number' ? `${padding}px` : padding,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Header row: a label on the left, a big stat value on the right. */
export function CardStatHead({ label, value, over = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-hint)' }}>{label}</span>
      <span
        style={{
          fontSize: 'var(--fs-stat)',
          fontWeight: 'var(--fw-bold)',
          fontVariantNumeric: 'tabular-nums',
          color: over ? 'var(--danger)' : 'var(--text-primary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
