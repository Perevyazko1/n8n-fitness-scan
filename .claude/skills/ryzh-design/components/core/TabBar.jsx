export function TabBar({
  tabs = [],             // [{ id, icon, label }]
  active,
  onChange,
  fixed = true,
  style,
  ...rest
}) {
  return (
    <nav
      style={{
        position: fixed ? 'fixed' : 'relative',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        display: 'flex',
        height: 'var(--tabbar-h)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--surface-page)',
        borderTop: '1px solid var(--border-hairline)',
        ...style,
      }}
      {...rest}
    >
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange && onChange(t.id)}
            style={{
              flex: 1,
              width: 'auto',
              margin: 0,
              padding: '6px 0',
              border: 'none',
              borderRadius: 0,
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              fontSize: 'var(--fs-tab)',
              fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-regular)',
              color: on ? 'var(--accent)' : 'var(--text-hint)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span
              style={{
                display: 'flex',
                lineHeight: 1,
                color: on ? 'var(--accent)' : 'var(--text-hint)',
              }}
            >
              {t.icon}
            </span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
