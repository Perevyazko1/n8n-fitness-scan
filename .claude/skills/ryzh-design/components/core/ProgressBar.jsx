export function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',          // 'md' (10px) | 'sm' (7px)
  over,                 // override; defaults to value > max
  color,                // custom fill color
  style,
  ...rest
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  const isOver = over != null ? over : value > max;
  const height = size === 'sm' ? 'var(--bar-h-sm)' : 'var(--bar-h)';

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      style={{
        height,
        borderRadius: '6px',
        background: 'var(--surface-track)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: '6px',
          background: color || (isOver ? 'var(--danger)' : 'var(--accent)'),
          transition: 'width var(--dur-bar) var(--ease-out)',
        }}
      />
    </div>
  );
}

/** A macro row: name · bar · value, on a 70px / 1fr / auto grid. */
export function MacroRow({ name, value, target, unit = 'г' }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '70px 1fr auto',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-hint)' }}>{name}</span>
      <ProgressBar value={value} max={target} size="sm" />
      <span style={{ fontSize: 'var(--fs-small)', fontVariantNumeric: 'tabular-nums' }}>
        {target ? `${value} / ${target}${unit}` : `${value}${unit}`}
      </span>
    </div>
  );
}
