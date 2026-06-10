const fieldStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border-input)',
  borderRadius: 'var(--radius-input)',
  fontSize: 'var(--fs-body)',
  fontFamily: 'var(--font-base)',
  background: 'var(--surface-page)',
  color: 'var(--text-primary)',
};

export function Input({ label, style, ...rest }) {
  const el = <input style={{ ...fieldStyle, ...style }} {...rest} />;
  if (!label) return el;
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 'var(--fs-tiny)', color: 'var(--text-hint)', marginBottom: '4px' }}>
        {label}
      </span>
      {el}
    </label>
  );
}

export function Select({ label, options = [], style, children, ...rest }) {
  const el = (
    <select style={{ ...fieldStyle, marginTop: label ? '4px' : 0, ...style }} {...rest}>
      {children ||
        options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
    </select>
  );
  if (!label) return el;
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 'var(--fs-tiny)', color: 'var(--text-hint)' }}>{label}</span>
      {el}
    </label>
  );
}
