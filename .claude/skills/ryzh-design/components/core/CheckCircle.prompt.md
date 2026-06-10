Round completion checkbox — the workout "set done" control. Empty ring fills green with a white check. Use for one-shot completion (done/not-done); use `Switch` for settings toggles.

```jsx
<CheckCircle checked={ex.done} onChange={(v) => toggle(ex, v)} />
```

- Animated check on toggle. `size` controls the diameter (30 default, 22 for compact lists).
- Pair it as the leading control in an exercise row; the row text gets strikethrough + 0.5 opacity when done.
