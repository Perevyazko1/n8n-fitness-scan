// StreakBadge — «серия»: сколько дней подряд. Иконки нарисованы инлайн
// (тот же набор, что Icon), чтобы не зависеть от кросс-модульного импорта.

function StreakFlame({ filled, size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M12 3.4 C12 7 16 8.6 16 12.8 A4 4 0 1 1 8 12.8 C8 10.9 9 9.5 10.2 8.7 C10 10.3 10.8 11.3 12 11.5 C13 9.9 12.4 6.5 12 3.4 Z" />
    </svg>
  );
}
function StreakSnow({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M12 3.5 V20.5" />
      <path d="M4.6 7.75 L19.4 16.25" />
      <path d="M19.4 7.75 L4.6 16.25" />
      <path d="M12 3.5 l-1.8 1.9 M12 3.5 l1.8 1.9 M12 20.5 l-1.8-1.9 M12 20.5 l1.8-1.9" />
      <path d="M4.6 7.75 l0.3 2.6 M4.6 7.75 l2.6-0.3 M19.4 16.25 l-0.3-2.6 M19.4 16.25 l-2.6 0.3" />
      <path d="M19.4 7.75 l-2.6-0.3 M19.4 7.75 l-0.3 2.6 M4.6 16.25 l2.6 0.3 M4.6 16.25 l0.3-2.6" />
    </svg>
  );
}

function pluralDays(n) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return 'дней';
  if (b > 1 && b < 5) return 'дня';
  if (b === 1) return 'день';
  return 'дней';
}

export function StreakBadge({
  count = 0,
  label,                 // что за серия: «Питание», «Тренировки»
  icon,                  // иконка категории (напр. <Icon name="meal" />)
  status = 'active',     // 'active' | 'cold' | 'frozen'
  style,
  ...rest
}) {
  const frozen = status === 'frozen';
  const cold = status === 'cold' || (count === 0 && status !== 'frozen');
  const statusColor = frozen ? '#3E8CD6' : cold ? 'var(--text-hint)' : 'var(--streak)';

  return (
    <div
      style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 'var(--radius)',
        background: 'var(--surface-card)',
        boxShadow: frozen
          ? 'inset 0 0 0 1.5px rgba(62,140,214,0.45), var(--shadow-card)'
          : 'var(--shadow-card)',
        ...style,
      }}
      {...rest}
    >
      {/* иконка категории — ЧТО за серия */}
      {icon && (
        <span style={{
          width: 34, height: 34, flex: '0 0 34px', borderRadius: '50%',
          background: cold ? 'var(--surface-chip)' : 'var(--accent-wash)',
          color: cold ? 'var(--text-hint)' : 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</span>
      )}

      <div style={{ minWidth: 0, flex: 1 }}>
        {/* число дней + статус-огонёк */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontSize: 19, fontWeight: 'var(--fw-heavy)', fontVariantNumeric: 'tabular-nums', color: cold ? 'var(--text-hint)' : 'var(--text-primary)', lineHeight: 1 }}>{count}</span>
          <span style={{ fontSize: 'var(--fs-tiny)', color: 'var(--text-hint)' }}>{pluralDays(count)}</span>
          <span style={{ marginLeft: 'auto', color: statusColor, display: 'flex' }}>
            {frozen ? <StreakSnow size={15} /> : <StreakFlame filled={!cold} size={15} />}
          </span>
        </div>
        {/* подпись: что это серия */}
        <div style={{ fontSize: 'var(--fs-tiny)', color: 'var(--text-hint)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {frozen ? 'серия под угрозой' : cold ? 'серия прервана' : `серия · ${label || ''}`}
        </div>
      </div>
    </div>
  );
}
