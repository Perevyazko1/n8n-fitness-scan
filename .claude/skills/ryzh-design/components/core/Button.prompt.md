Full-width tap-target button — the app's main action control; use `primary` for the one main action per screen, `secondary` for alternates, `ghost` for cancel/back.

```jsx
<Button variant="primary" onClick={save}>Съел 100г → 121 ккал</Button>
<Button variant="secondary">В продукты</Button>
<Button variant="ghost">Назад к камере</Button>
```

- `loading` swaps the label for a spinner + «Отправляю…» and blocks the button.
- `disabled` dims to 0.5. Buttons are full-width by default; pass `fullWidth={false}` for inline use.
- Requires the `@keyframes ryzh-spin` rule (provided by the card host / app) when `loading`.
