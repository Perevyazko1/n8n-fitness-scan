Progress track for calories and macros; fill turns danger-red automatically when `value > max`.

```jsx
<ProgressBar value={243} max={1687} />
<MacroRow name="Белок" value={17} target={137} />
```

- `size="sm"` (7px) for macro bars inside a `MacroRow`; default `md` (10px) for the kcal bar.
- `MacroRow` lays out name · bar · value on a fixed grid so multiple stack in alignment.
- Pass `color` to override the fill (rarely needed).
