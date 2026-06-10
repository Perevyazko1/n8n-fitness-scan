Form fields for settings and manual entry — text `Input` and native `Select`, both 16px to stop iOS zoom.

Pass `label` for a hint caption above; omit it for a bare field (e.g. in a grid). Use `inputMode="numeric"` for gram/number entry.

```jsx
<Input label="Рост, см" type="number" value={h} onChange={onH} />
<Select label="Цель" value={goal} onChange={onGoal}
  options={[{ value: 'lose', label: 'Похудение' }, { value: 'maintain', label: 'Поддержание' }]} />
```
