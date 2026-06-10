export function SegmentedControl({
  options = [],          // [{ value, label }] or ['a','b']
  value,
  onChange,
  style,
  ...rest
}) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        background: 'var(--surface-card)',
        borderRadius: '12px',
        padding: '4px',
        ...style,
      }}
      {...rest}
    >
      {opts.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange && onChange(o.value)}
            style={{
              flex: 1,
              width: 'auto',
              margin: 0,
              padding: '8px',
              border: 'none',
              borderRadius: '9px',
              fontSize: 'var(--fs-sub)',
              fontFamily: 'var(--font-base)',
              fontWeight: active ? 'var(--fw-semibold)' : 'var(--fw-regular)',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--accent-text)' : 'var(--text-hint)',
              cursor: 'pointer',
              transition: 'background var(--dur-base) var(--ease-out)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
