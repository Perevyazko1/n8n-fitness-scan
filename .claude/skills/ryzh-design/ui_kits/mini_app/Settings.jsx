// Settings / Профиль — открывается с шестерёнки на дашборде.
// Норма калорий и Б/Ж/У считаются вживую (формула Миффлина — Сан-Жеора).
const DSS = window.RyzhFitnessDesignSystem_eec584;
const { Icon: IconS } = DSS;

function calcNorms({ sex, weight, height, age, goal, activity }) {
  const w = +weight || 0, h = +height || 0, a = +age || 0;
  let bmr = 10 * w + 6.25 * h - 5 * a + (sex === 'm' ? 5 : -161);
  const actK = { low: 1.2, mid: 1.375, high: 1.55, athlete: 1.725 }[activity] || 1.375;
  let tdee = bmr * actK;
  tdee *= goal === 'lose' ? 0.85 : goal === 'gain' ? 1.1 : 1;
  const kcal = Math.round(tdee / 10) * 10;
  const protein = Math.round(w * (goal === 'gain' ? 2.0 : 1.8));
  const fat = Math.round((kcal * 0.27) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, fat, carbs };
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 'var(--fs-tiny)', color: 'var(--text-hint)', marginBottom: 4 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid var(--border-input)',
  borderRadius: 'var(--radius-input)', fontSize: 'var(--fs-body)', fontFamily: 'var(--font-base)',
  background: 'var(--surface-page)', color: 'var(--text-primary)',
};

function SettingsSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="sec-head" style={{ marginTop: 0 }}>{title}</div>
      <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function Settings({ onClose }) {
  const { SegmentedControl, Button } = DSS;
  const [p, setP] = React.useState({ sex: 'm', height: 178, weight: 74, age: 29, bodyFat: '', goal: 'lose', activity: 'mid', auto: true });
  const [manual, setManual] = React.useState({ kcal: 1687, protein: 137, fat: 76, carbs: 193 });
  const set = (k, v) => setP((s) => ({ ...s, [k]: v }));
  const norms = p.auto ? calcNorms(p) : manual;

  return (
    <div style={{ position: 'relative', minHeight: '100%', background: 'var(--surface-page)', paddingBottom: 24 }}>
      {/* header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--surface-page)', borderBottom: '1px solid var(--border-hairline)' }}>
        <button onClick={onClose} aria-label="Назад" style={{ width: 38, height: 38, flex: '0 0 38px', margin: 0, padding: 0, border: 'none', borderRadius: '50%', background: 'var(--surface-chip)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <IconS name="chevronLeft" size={20} />
        </button>
        <div style={{ fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-bold)' }}>Профиль</div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* профиль-шапка */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, flex: '0 0 56px', borderRadius: '50%', overflow: 'hidden', background: 'radial-gradient(circle at 50% 34%, var(--medallion-1), var(--medallion-2) 72%)', boxShadow: '0 0 0 2.5px var(--accent)' }}>
            <img src="../../assets/mascot/fox_m3_b0.png" alt="" style={{ width: '128%', height: '128%', objectFit: 'cover', objectPosition: '50% 16%', marginLeft: '-14%', marginTop: '-6%' }} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--fs-stat-title)', fontWeight: 'var(--fw-semibold)' }}>Андрей</div>
            <div className="muted small">@andrey · Telegram</div>
          </div>
        </div>

        <SettingsSection title="Параметры тела">
          <Field label="Пол">
            <SegmentedControl value={p.sex} onChange={(v) => set('sex', v)} options={[{ value: 'm', label: 'Мужской' }, { value: 'f', label: 'Женский' }]} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="Рост, см"><input style={inputStyle} type="number" inputMode="numeric" value={p.height} onChange={(e) => set('height', e.target.value)} /></Field>
            <Field label="Вес, кг"><input style={inputStyle} type="number" inputMode="numeric" value={p.weight} onChange={(e) => set('weight', e.target.value)} /></Field>
            <Field label="Возраст"><input style={inputStyle} type="number" inputMode="numeric" value={p.age} onChange={(e) => set('age', e.target.value)} /></Field>
          </div>
          <Field label={<>% жира <span style={{ color: 'var(--text-hint)', fontWeight: 400 }}>· необязательно</span></>}>
            <input style={inputStyle} type="number" inputMode="numeric" placeholder="напр. 18" value={p.bodyFat} onChange={(e) => set('bodyFat', e.target.value)} />
          </Field>
        </SettingsSection>

        <SettingsSection title="Цель">
          <SegmentedControl value={p.goal} onChange={(v) => set('goal', v)} options={[{ value: 'lose', label: 'Похудение' }, { value: 'maintain', label: 'Поддержание' }, { value: 'gain', label: 'Набор' }]} />
          <Field label="Активность">
            <select style={inputStyle} value={p.activity} onChange={(e) => set('activity', e.target.value)}>
              <option value="low">Низкая — сидячий образ</option>
              <option value="mid">Средняя — 1–3 трен/нед</option>
              <option value="high">Высокая — 4–5 трен/нед</option>
              <option value="athlete">Очень высокая — спорт</option>
            </select>
          </Field>
        </SettingsSection>

        {/* дневная норма */}
        <SettingsSection title="Дневная норма">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <DSS.Switch checked={p.auto} onChange={(v) => set('auto', v)} />
            <span style={{ fontSize: 'var(--fs-label)' }}>Считать автоматически</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Norm label="Калории" value={norms.kcal} unit="ккал" big />
            <Norm label="Белки" value={norms.protein} unit="г" />
            <Norm label="Жиры" value={norms.fat} unit="г" />
            <Norm label="Углеводы" value={norms.carbs} unit="г" />
          </div>
          {p.auto
            ? <div className="muted small">Формула Миффлина — Сан-Жеора по твоим данным. Меняй параметры выше — пересчёт мгновенный.</div>
            : <div className="muted small">Ручной режим — задай значения сам (в проде здесь поля ввода).</div>}
        </SettingsSection>

        <Button variant="primary">Сохранить</Button>
      </div>
    </div>
  );
}

function Norm({ label, value, unit, big }) {
  return (
    <div style={{ background: 'var(--surface-page)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)', padding: '10px 12px' }}>
      <div className="muted" style={{ fontSize: 'var(--fs-tiny)' }}>{label}</div>
      <div style={{ fontSize: big ? 22 : 18, fontWeight: 'var(--fw-bold)', fontVariantNumeric: 'tabular-nums', color: big ? 'var(--accent)' : 'var(--text-primary)' }}>
        {value}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-hint)' }}> {unit}</span>
      </div>
    </div>
  );
}

Object.assign(window, { Settings });
