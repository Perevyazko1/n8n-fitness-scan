Self-explanatory streak counter for the dashboard — «серия N дней». Category icon (what), day count with correct Russian plural, and a flame/snowflake status pip. Two side by side (nutrition + workout).

```jsx
<div style={{ display: 'flex', gap: 10 }}>
  <StreakBadge count={5} label="Питание" icon={<Icon name="meal" size={18} />} />
  <StreakBadge count={2} label="Тренировки" icon={<Icon name="dumbbell" size={18} />} status="active" />
</div>
```

- `status="frozen"` → snowflake + blue ring + caption «серия под угрозой». `cold` → greyed + «серия прервана».
- A 0 count auto-greys unless `frozen`. `count` auto-pluralises день/дня/дней.
