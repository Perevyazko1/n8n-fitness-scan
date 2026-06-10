// Workout (Тренировка) — Вариант A: карточка прогресса + чек-кружки.
const DSW = window.RyzhFitnessDesignSystem_eec584;
const { Icon: IconW } = DSW;

const EXERCISES = [
  { group: 'Разминка', name: 'Кардио (велотренажёр)', sub: '10 мин', done: true },
  { group: 'Силовая', name: 'Жим лёжа', sub: '4×8-10 · 60кг', done: true },
  { group: 'Силовая', name: 'Жим гантелей на наклонной', sub: '3×10 · 22кг', done: true },
  { group: 'Силовая', name: 'Подъём штанги на бицепс', sub: '4×10 · 30кг', done: false },
  { group: 'Силовая', name: 'Молотки с гантелями', sub: '3×12 · 14кг', done: false },
  { group: 'Кор', name: 'Планка', sub: '3×60сек', done: false },
];

function ProgressHeader({ title, done, total }) {
  const { Card } = DSW;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const left = total - done;
  const plural = left === 1 ? 'упражнение' : (left >= 2 && left <= 4 ? 'упражнения' : 'упражнений');
  return (
    <Card style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontSize: 'var(--fs-label)', fontWeight: 'var(--fw-semibold)' }}>{title}</div>
        <div style={{ fontWeight: 'var(--fw-heavy)', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{done}/{total}</div>
      </div>
      <div style={{ height: 'var(--bar-h)', borderRadius: 6, background: 'var(--surface-track)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct + '%', background: 'var(--accent)', borderRadius: 6, transition: 'width var(--dur-bar) var(--ease-out)' }} />
      </div>
      <div className="muted small" style={{ marginTop: 8 }}>
        {left === 0 ? 'Всё выполнено — красавчик! 🦊' : `~45 мин · осталось ${left} ${plural}`}
      </div>
    </Card>
  );
}

function ExerciseRow({ ex, onToggle }) {
  const { CheckCircle } = DSW;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 14px', background: 'var(--surface-card)', borderRadius: 'var(--radius)',
      marginBottom: 10, boxShadow: 'var(--shadow-card)',
    }}>
      <CheckCircle checked={ex.done} onChange={() => onToggle(ex)} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-semibold)',
          textDecoration: ex.done ? 'line-through' : 'none', opacity: ex.done ? 0.5 : 1,
          transition: 'opacity .2s',
        }}>{ex.name}</div>
        <div className="muted small" style={{ opacity: ex.done ? 0.6 : 1 }}>{ex.sub}</div>
      </div>
    </div>
  );
}

function Workout() {
  const { ChipRow, Chip, Button } = DSW;
  const [block, setBlock] = React.useState(1);
  const [exs, setExs] = React.useState(EXERCISES);
  const toggle = (ex) => setExs((cur) => cur.map((e) => (e === ex ? { ...e, done: !e.done } : e)));
  const done = exs.filter((e) => e.done).length;
  const allDone = done === exs.length;

  let lastGroup = null;
  return (
    <div style={{ padding: '16px 16px 8px' }}>
      <PageHead title="Тренировка" sub="среда, 4 июня" />
      <ChipRow style={{ marginBottom: 14 }}>
        {[1, 2, 3, 4].map((n) => (
          <Chip key={n} active={n === block} onClick={() => setBlock(n)}>№{n}</Chip>
        ))}
      </ChipRow>

      <ProgressHeader title="№1 — Грудь + Бицепс" done={done} total={exs.length} />

      {exs.map((ex, i) => {
        const head = ex.group !== lastGroup ? ex.group : null;
        lastGroup = ex.group;
        return (
          <React.Fragment key={i}>
            {head && <div className="sec-head">{head}</div>}
            <ExerciseRow ex={ex} onToggle={toggle} />
          </React.Fragment>
        );
      })}

      <div style={{ marginTop: 6 }}>
        <Button variant="primary" disabled={!allDone}>
          {allDone ? 'Завершить тренировку' : `Завершить · ${done} из ${exs.length}`}
        </Button>
      </div>
    </div>
  );
}

Object.assign(window, { Workout, ExerciseRow, ProgressHeader });
