// Dashboard (Главная) — заголовок, маскот + голос Рыжа, стрики,
// тренировка (со стрелкой), калории кольцом, макросы.
const DS = window.RyzhFitnessDesignSystem_eec584;
const { Icon } = DS;

function PageHead({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 'var(--fw-bold)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>{title}</h1>
        {sub && <div style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-hint)', marginTop: 3 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function IconButton({ children, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 'var(--icon-btn)', height: 'var(--icon-btn)', flex: '0 0 var(--icon-btn)',
        margin: 0, padding: 0, border: 'none', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface-chip)', color: 'var(--text-secondary)', cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

// ── Динамичный маскот: тело по тирам × событие ──
// muscle 0–3 (тренировки) × belly 0–3 (питание/вес); status — событие дня.
const FOX_SCENES = {
  normal: { m: 3, b: 0, status: 'normal', label: 'Норма',
    voice: 'Пять дней подряд — мышцы прут. Не дай мне отрастить пузо: ещё 1444 ккал в запасе.' },
  risk:   { m: 2, b: 1, status: 'risk', label: 'Стрик под угрозой',
    voice: 'Эй! Стрик питания под угрозой — залогируй ужин, пока я не замёрз.' },
  win:    { m: 3, b: 0, status: 'win', label: 'Цель закрыта',
    voice: 'Цель дня закрыта, и я в отличной форме. Так держать!' },
  lost:   { m: 1, b: 2, status: 'lost', label: 'Срыв',
    voice: 'Эх… стрик сорвался, и я подрасплылся. Ничего — начнём заново, ты сможешь.' },
};

const STATUS_RING = { normal: 'var(--accent)', risk: '#3E8CD6', win: 'var(--success)', lost: 'var(--warm-400)' };

function Medallion({ m = 3, b = 0, status = 'normal', size = 132 }) {
  const src = `../../assets/mascot/fox_m${m}_b${b}.png`;
  const ring = STATUS_RING[status] || 'var(--accent)';
  const filter = status === 'lost' ? 'grayscale(0.45) saturate(0.7)' : status === 'risk' ? 'saturate(0.85)' : 'none';
  const badge = status === 'risk' ? { icon: 'snowflake', bg: '#3E8CD6' }
              : status === 'win' ? { icon: 'trophy', bg: 'var(--success)' }
              : null;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 34%, var(--medallion-1) 0%, var(--medallion-2) 72%)',
        boxShadow: `0 0 0 3px ${ring}, var(--shadow-raised)`, transition: 'box-shadow var(--dur-base) var(--ease-out)',
      }}>
        <img src={src} alt="Рыж" style={{ width: '128%', height: '128%', objectFit: 'cover', objectPosition: '50% 16%', marginLeft: '-14%', marginTop: '-6%', filter, transition: 'filter var(--dur-base) var(--ease-out)' }} />
      </div>
      {badge && (
        <div style={{
          position: 'absolute', right: -2, top: 2, width: 36, height: 36, borderRadius: '50%',
          background: badge.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(80,50,20,0.25)', border: '2.5px solid var(--surface-page)',
        }}>
          <Icon name={badge.icon} size={19} fill={badge.icon === 'snowflake'} />
        </div>
      )}
    </div>
  );
}

// Голос Рыжа — одна живая строка, завязанная на состояние.
function RyzhSays({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 16 }}>
      <div style={{
        position: 'relative', maxWidth: 280, textAlign: 'center',
        background: 'var(--surface-card)', boxShadow: 'var(--shadow-card)',
        borderRadius: 14, padding: '10px 14px',
        fontSize: 'var(--fs-small)', lineHeight: 1.4, color: 'var(--text-secondary)',
      }}>
        {/* хвостик пузыря вверх к лису */}
        <span style={{
          position: 'absolute', top: -6, left: '50%', width: 12, height: 12, marginLeft: -6,
          background: 'var(--surface-card)', transform: 'rotate(45deg)',
          boxShadow: '-2px -2px 4px rgba(120,90,40,0.04)',
        }} />
        <b style={{ color: 'var(--accent)' }}>Рыж:</b> {text}
      </div>
    </div>
  );
}

// Кольцо калорий.
function CalorieRing({ eaten, goal, size = 132, stroke = 13 }) {
  const left = Math.max(0, goal - eaten);
  const over = eaten > goal;
  const pct = Math.max(0, Math.min(1, eaten / goal));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: `0 0 ${size}px` }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-track)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={over ? 'var(--danger)' : 'var(--accent)'} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`} style={{ transition: 'stroke-dasharray var(--dur-bar) var(--ease-out)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 'var(--fw-heavy)', fontVariantNumeric: 'tabular-nums', lineHeight: 1, color: over ? 'var(--danger)' : 'var(--text-primary)' }}>{over ? eaten - goal : left}</div>
        <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 3 }}>{over ? 'перебор, ккал' : 'осталось, ккал'}</div>
      </div>
    </div>
  );
}

function Dashboard({ onOpenSettings }) {
  const { Card, MacroRow, StreakBadge } = DS;
  const eaten = 243, goal = 1687;
  const [scene, setScene] = React.useState('normal');
  const s = FOX_SCENES[scene];
  return (
    <div style={{ padding: '16px 16px 8px' }}>
      <PageHead
        title="Сегодня"
        sub="среда, 4 июня"
        action={<IconButton label="Настройки" onClick={onOpenSettings}><Icon name="settings" size={20} /></IconButton>}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Medallion m={s.m} b={s.b} status={s.status} />
        <RyzhSays text={s.voice} />
      </div>

      {/* демо-переключатель состояний Рыжа */}
      <FoxStatePicker value={scene} onChange={setScene} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <StreakBadge count={5} label="Питание" icon={<Icon name="meal" size={18} />} status={scene === 'risk' ? 'frozen' : scene === 'lost' ? 'cold' : 'active'} />
        <StreakBadge count={2} label="Тренировки" icon={<Icon name="dumbbell" size={18} />} />
      </div>

      <button onClick={() => {}} style={{ width: '100%', margin: 0, padding: 0, border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', marginBottom: 12, display: 'block' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, flex: '0 0 44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-wash)', color: 'var(--accent)' }}>
              <Icon name="dumbbell" size={24} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--fs-stat-title)', fontWeight: 'var(--fw-semibold)' }}>Сегодня тренировка</div>
              <div className="muted small">№1 — Грудь + Бицепс · 2 из 6</div>
            </div>
            <span style={{ color: 'var(--text-hint)', display: 'flex' }}><Icon name="chevronRight" size={20} /></span>
          </div>
        </Card>
      </button>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CalorieRing eaten={eaten} goal={goal} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-hint)', marginBottom: 8 }}>Калории</div>
            <Legend color="var(--accent)" label="Съедено" value={`${eaten} ккал`} />
            <Legend color="var(--surface-track)" label="Цель" value={`${goal} ккал`} />
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <MacroRow name="Белок" value={17} target={137} />
        <MacroRow name="Жиры" value={5} target={76} />
        <MacroRow name="Углеводы" value={3} target={193} />
      </Card>
    </div>
  );
}

function FoxStatePicker({ value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="muted" style={{ fontSize: 11, textAlign: 'center', marginBottom: 6, opacity: 0.8 }}>
        Рыж реагирует на прогресс · демо
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {Object.entries(FOX_SCENES).map(([key, sc]) => {
          const on = key === value;
          return (
            <button key={key} onClick={() => onChange(key)} style={{
              flex: 1, padding: '7px 4px', margin: 0, border: 'none', borderRadius: 'var(--radius-pill)',
              fontSize: 11, fontFamily: 'var(--font-base)', fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-regular)',
              background: on ? 'var(--accent)' : 'var(--surface-chip)', color: on ? '#fff' : 'var(--text-hint)',
              cursor: 'pointer', transition: 'background var(--dur-base) var(--ease-out)', whiteSpace: 'nowrap',
            }}>{sc.label}</button>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flex: '0 0 10px' }} />
      <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-hint)' }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: 'var(--fs-small)', fontWeight: 'var(--fw-semibold)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

Object.assign(window, { Dashboard, PageHead, IconButton, Medallion, FOX_SCENES });
