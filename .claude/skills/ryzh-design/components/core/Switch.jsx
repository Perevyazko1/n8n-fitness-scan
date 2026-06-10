export function Switch({
  checked = false,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 'var(--switch-w)',
        height: 'var(--switch-h)',
        flex: '0 0 auto',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked, e)}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          margin: 0,
          padding: 0,
          border: 'none',
          width: '100%',
          height: '100%',
          borderRadius: 'var(--radius-pill)',
          background: checked ? 'var(--success)' : 'var(--warm-400)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background var(--dur-base) var(--ease-out)',
        }}
        {...rest}
      />
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: 'var(--switch-knob)',
          height: 'var(--switch-knob)',
          borderRadius: '50%',
          background: '#fff',
          boxShadow: 'var(--shadow-knob)',
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform var(--dur-base) var(--ease-out)',
          pointerEvents: 'none',
        }}
      />
    </span>
  );
}
