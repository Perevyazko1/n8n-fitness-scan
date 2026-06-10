iOS-style on/off toggle — the workout "done" control. Green when on, white sliding knob.

```jsx
<Switch checked={done} onChange={(v) => setDone(v)} />
```

- `onChange` receives the new boolean first. Disabled state dims to 0.6.
- Keep it as the trailing control in a row (exercise name left, switch right).
