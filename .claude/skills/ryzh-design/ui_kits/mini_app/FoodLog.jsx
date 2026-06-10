// Food (Еда) — дневник: бюджет дня + группировка по приёмам + строка с меню «…».
const DSF = window.RyzhFitnessDesignSystem_eec584;
const { Icon: IconF } = DSF;

const GOAL = 1687;

function DayNav({ label, onPrev, onNext, nextDisabled }) {
  const btn = (name, onClick, disabled) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 'var(--nav-btn)', height: 'var(--nav-btn)', flex: '0 0 auto', margin: 0, padding: 0,
        border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface-chip)', color: 'var(--text-secondary)',
        opacity: disabled ? 0.35 : 1, cursor: disabled ? 'default' : 'pointer',
      }}
    ><IconF name={name} size={20} /></button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
      {btn('chevronLeft', onPrev)}
      <span style={{ minWidth: 120, textAlign: 'center', fontSize: 'var(--fs-label)', fontWeight: 'var(--fw-semibold)' }}>{label}</span>
      {btn('chevronRight', onNext, nextDisabled)}
    </div>
  );
}

// Бюджет дня — осталось + мини-бар + КБЖУ.
function BudgetCard({ eaten, sum }) {
  const { Card } = DSF;
  const left = GOAL - eaten;
  const over = left < 0;
  return (
    <Card style={{ marginBottom: 14, padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span className="muted" style={{ fontSize: 'var(--fs-small)' }}>{over ? 'Перебор' : 'Осталось на сегодня'}</span>
        <span style={{ fontWeight: 'var(--fw-heavy)', color: over ? 'var(--danger)' : 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
          {Math.abs(left)} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-hint)' }}>ккал</span>
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 5, background: 'var(--surface-track)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: Math.min(100, eaten / GOAL * 100) + '%', background: over ? 'var(--danger)' : 'var(--accent)', borderRadius: 5, transition: 'width var(--dur-bar) var(--ease-out)' }} />
      </div>
      <div className="muted small" style={{ marginTop: 7, fontVariantNumeric: 'tabular-nums' }}>{eaten} из {GOAL} · Б{sum.p} · Ж{sum.f} · У{sum.c}</div>
    </Card>
  );
}

// Заголовок приёма пищи: название · подытог · «＋».
function MealHeader({ name, kcal, onAdd }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 2px 8px' }}>
      <span style={{ fontSize: 'var(--fs-small)', fontWeight: 'var(--fw-bold)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', color: 'var(--text-secondary)' }}>{name}</span>
      <span style={{ marginLeft: 'auto', fontSize: 'var(--fs-small)', color: 'var(--text-hint)', fontVariantNumeric: 'tabular-nums' }}>{kcal} ккал</span>
      <button onClick={onAdd} aria-label={`Добавить в «${name}»`} style={{
        width: 26, height: 26, flex: '0 0 26px', borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: 'var(--accent-wash)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><IconF name="plus" size={16} /></button>
    </div>
  );
}

const ROW_ACTIONS = [
  { icon: 'edit', label: 'Изменить вес / приём' },
  { icon: 'repeat', label: 'Повторить' },
  { icon: 'plus', label: 'В мои продукты' },
  { icon: 'close', label: 'Удалить', danger: true },
];

// Всплывающее меню рядом со строкой (привязано к кнопке «…»).
function RowMenu({ onClose }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', top: 46, right: 8, zIndex: 50, minWidth: 218,
        background: 'var(--surface-card)', borderRadius: 12, padding: 5,
        boxShadow: '0 10px 28px rgba(80,50,20,0.22)', border: '1px solid var(--border-hairline)',
      }}
    >
      {/* носик к кнопке «…» */}
      <span style={{
        position: 'absolute', top: -6, right: 14, width: 12, height: 12, background: 'var(--surface-card)',
        borderLeft: '1px solid var(--border-hairline)', borderTop: '1px solid var(--border-hairline)',
        transform: 'rotate(45deg)',
      }} />
      {ROW_ACTIONS.map((a, i) => (
        <React.Fragment key={a.label}>
          {a.danger && <div style={{ height: 1, background: 'var(--border-hairline)', margin: '4px 8px' }} />}
          <button onClick={onClose} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 10px', margin: 0,
            border: 'none', borderRadius: 8, background: 'transparent', cursor: 'pointer', textAlign: 'left',
            color: a.danger ? 'var(--danger)' : 'var(--text-primary)', fontSize: 'var(--fs-label)', fontFamily: 'var(--font-base)',
          }}>
            <IconF name={a.icon} size={18} color={a.danger ? 'var(--danger)' : 'var(--text-secondary)'} />
            {a.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

// Строка еды: чистая, калории в колонке, одна кнопка «…» со всплывающим меню.
function FoodRow({ item, open, onToggleMenu, onClose }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px',
      background: 'var(--surface-card)', borderRadius: 'var(--radius)', marginBottom: 8,
      boxShadow: 'var(--shadow-card)', zIndex: open ? 30 : 'auto',
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-semibold)', wordBreak: 'break-word' }}>{item.desc}</div>
        <div className="muted small" style={{ fontVariantNumeric: 'tabular-nums' }}>{item.time} · Б{item.p} · Ж{item.f} · У{item.c}</div>
      </div>
      <div style={{ flex: '0 0 58px', width: 58, textAlign: 'right', fontSize: 17, fontWeight: 'var(--fw-bold)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
        {item.kcal}<div style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-hint)' }}>ккал</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onToggleMenu(); }} aria-label="Действия" style={{
        width: 'var(--row-add-btn)', height: 'var(--row-add-btn)', flex: '0 0 auto', margin: 0, padding: 0,
        border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: open ? 'var(--accent-wash)' : 'transparent', color: open ? 'var(--accent)' : 'var(--text-hint)', cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-out)',
      }}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" />
        </svg>
      </button>
      {open && <RowMenu onClose={onClose} />}
    </div>
  );
}

// Пустое состояние с Рыжем.
function EmptyDay({ title, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 24px 16px', gap: 4 }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', marginBottom: 8,
        background: 'radial-gradient(circle at 50% 34%, var(--medallion-1) 0%, var(--medallion-2) 72%)',
        boxShadow: '0 0 0 3px var(--accent), var(--shadow-raised)', filter: 'saturate(0.9)',
      }}>
        <img src="../../assets/mascot/fox_m0_b0.png" alt="Рыж" style={{ width: '128%', height: '128%', objectFit: 'cover', objectPosition: '50% 16%', marginLeft: '-14%', marginTop: '-6%' }} />
      </div>
      <div style={{ fontSize: 'var(--fs-stat-title)', fontWeight: 'var(--fw-semibold)' }}>{title}</div>
      <div style={{ fontSize: 'var(--fs-small)', color: 'var(--text-hint)', maxWidth: 240, lineHeight: 1.4 }}>{hint}</div>
    </div>
  );
}

const FOOD = [
  { meal: 'Завтрак', desc: 'Творог 5% 200г', time: '08:30', kcal: 242, p: 34, f: 10, c: 6 },
  { meal: 'Завтрак', desc: 'Банан 120г', time: '11:10', kcal: 107, p: 1, f: 0, c: 27 },
  { meal: 'Обед', desc: 'Куриная грудка 180г', time: '14:25', kcal: 297, p: 56, f: 6, c: 0 },
  { meal: 'Обед', desc: 'Гречка варёная 150г', time: '14:25', kcal: 165, p: 6, f: 2, c: 33 },
];
const MEAL_ORDER = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];

const DAYS = [
  { label: 'Вчера', items: [] },
  { label: 'Сегодня', items: FOOD },
];

function FoodLog() {
  const { SegmentedControl, Button } = DSF;
  const [mode, setMode] = React.useState('diary');
  const [dayIdx, setDayIdx] = React.useState(1);
  const [openKey, setOpenKey] = React.useState(null);
  const day = DAYS[dayIdx];
  const sum = day.items.reduce((a, i) => ({ kcal: a.kcal + i.kcal, p: a.p + i.p, f: a.f + i.f, c: a.c + i.c }), { kcal: 0, p: 0, f: 0, c: 0 });
  const meals = MEAL_ORDER.filter((m) => day.items.some((i) => i.meal === m));

  return (
    <div style={{ position: 'relative', minHeight: '100%', padding: '16px 16px 8px' }}>
      {openKey !== null && (
        <div onClick={() => setOpenKey(null)} style={{ position: 'absolute', inset: 0, zIndex: 20 }} />
      )}
      <PageHead title="Еда" sub={mode === 'diary' ? day.label : '12 продуктов'} />
      <div style={{ marginBottom: 14 }}>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[{ value: 'diary', label: 'Дневник' }, { value: 'products', label: 'Мои продукты' }]}
        />
      </div>

      {mode === 'diary' ? (
        <>
          <DayNav
            label={day.label}
            onPrev={() => setDayIdx((i) => Math.max(0, i - 1))}
            onNext={() => setDayIdx((i) => Math.min(DAYS.length - 1, i + 1))}
            nextDisabled={dayIdx >= DAYS.length - 1}
          />
          {day.items.length ? (
            <>
              <BudgetCard eaten={sum.kcal} sum={sum} />
              {meals.map((m) => {
                const items = day.items.filter((i) => i.meal === m);
                const mk = items.reduce((a, i) => a + i.kcal, 0);
                return (
                  <div key={m}>
                    <MealHeader name={m} kcal={mk} onAdd={() => {}} />
                    {items.map((it, i) => {
                      const key = `${m}-${i}`;
                      return (
                        <FoodRow
                          key={key}
                          item={it}
                          open={openKey === key}
                          onToggleMenu={() => setOpenKey((k) => (k === key ? null : key))}
                          onClose={() => setOpenKey(null)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <BudgetCard eaten={0} sum={sum} />
              <EmptyDay title="За этот день — ничего" hint="Рыж не видел ни крошки. Отсканируй штрихкод или добавь из продуктов." />
              <Button variant="secondary"><IconF name="plus" size={18} /> Добавить из продуктов</Button>
            </>
          )}
        </>
      ) : (
        <>
          {[
            { name: 'творог 5%', sub: '88 ккал/100г · Б18 · Ж5 · У3' },
            { name: 'куриная грудка', sub: '165 ккал/100г · Б31 · Ж4 · У0' },
            { name: 'гречка варёная', sub: '110 ккал/100г · Б4 · Ж1 · У22' },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', background: 'var(--surface-card)', borderRadius: 'var(--radius)', marginBottom: 10, boxShadow: 'var(--shadow-card)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-semibold)' }}>{p.name}</div>
                <div className="muted small">{p.sub}</div>
              </div>
              <button aria-label="Добавить" style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--accent-wash)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <IconF name="plus" size={18} />
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

Object.assign(window, { FoodLog, DayNav, FoodRow });
