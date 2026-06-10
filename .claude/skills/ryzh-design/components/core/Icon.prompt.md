Линейная иконка набора «Рыж» — единственный источник иконографики (эмодзи в новом дизайне не используются). 24×24, штрих `currentColor`, скруглённые концы; цвет наследуется от текста.

```jsx
<Icon name="flame" color="var(--streak)" />
<Icon name="dumbbell" size={28} />
<Icon name="check" color="var(--success)" />
<Icon name="settings" title="Настройки" />   // семантическая (role=img)
```

Доступные имена: `home, meal, dumbbell, scan, flame, snowflake, check, lock, leaf, trophy, settings, chevronLeft, chevronRight, plus, repeat, edit, close` (см. `RyzhIconNames`).

- По умолчанию декоративная (`aria-hidden`). Передай `title` для смысловой иконки.
- `flame` поддерживает `fill` — для активного стрика.
- Тонируй через `color` или цвет родителя: `var(--accent)`, `var(--streak)`, `var(--success)`, `var(--danger)`, `var(--text-hint)`.
