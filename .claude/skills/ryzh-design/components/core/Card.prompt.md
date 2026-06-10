Surface container for every grouped block — dashboard stats, settings, modal bodies. Secondary-bg fill, signature 14px radius, 16px inset, 8px internal gap.

```jsx
<Card>
  <CardStatHead label="Калории" value="1444 ккал" />
  <ProgressBar value={243} max={1687} />
  <span className="muted small">243 из 1687 ккал · осталось 1444</span>
</Card>
```

- `CardStatHead` is the common header: muted label left, bold tabular value right; pass `over` to flip the value to danger red.
- Compose freely inside — rows, bars, macro lines. Use `padding={20}` for modal-style cards.
