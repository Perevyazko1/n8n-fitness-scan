Pill selector for mutually-exclusive options — the workout block picker (№1–№4).

```jsx
<ChipRow>
  {blocks.map((b) => (
    <Chip key={b.n} active={b.n === sel} onClick={() => setSel(b.n)}>{b.label}</Chip>
  ))}
</ChipRow>
```

- One active chip at a time; active = filled accent, rest = grey.
- `ChipRow` wraps them with 8px gaps. For a 2–3 way segmented look, use `SegmentedControl` instead.
