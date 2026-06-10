Two-way inset toggle for switching views — «Дневник / Мои продукты».

```jsx
<SegmentedControl
  options={[{ value: 'diary', label: 'Дневник' }, { value: 'products', label: 'Мои продукты' }]}
  value={mode}
  onChange={setMode}
/>
```

- Best for 2-3 equal-weight modes. For 4+ choices use a `ChipRow` of `Chip`s.
- Segments stretch to fill; active is bold + accent fill.
