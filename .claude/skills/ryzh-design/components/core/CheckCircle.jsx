export function CheckCircle({
  checked = false,
  onChange,
  size = 30,
  disabled = false,
  style,
  ...rest
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => onChange && onChange(!checked, e)}
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        margin: 0,
        padding: 0,
        borderRadius: '50%',
        border: checked ? 'none' : '2px solid var(--border-input)',
        background: checked ? 'var(--success)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      {...rest}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.58}
        height={size * 0.58}
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: checked ? 1 : 0,
          transform: checked ? 'scale(1)' : 'scale(0.6)',
          transition: 'opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
        }}
      >
        <path d="M5 12.5 l4.2 4.2 L19 6.8" />
      </svg>
    </button>
  );
}
