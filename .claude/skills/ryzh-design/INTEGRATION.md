# INTEGRATION.md — перенос Ryzh Design System в реальный код

Шпаргалка для интеграции этой дизайн-системы в продакшен-проект
(в первую очередь — в `n8n-fitness-scan`, ванильный Telegram Mini App).

---

## 0. Что есть что

| Папка | Это | Как использовать в проде |
|-------|-----|--------------------------|
| `styles.css` + `tokens/` | CSS custom properties (Cream-тема) | **Копировать как есть**, подключить одним `<link>` |
| `components/core/*.jsx` | React-примитивы | **Референс-реализация** — копировать в свой `src/`, отвязав от витринного бандла |
| `components/core/Icon.jsx` | Линейные SVG-иконки | Копировать напрямую (самодостаточный) |
| `ui_kits/mini_app/*` | Готовые экраны-эталоны | Визуальный образец для воспроизведения (внутри — моки) |
| `assets/mascot/*.png` | 16 рендеров лиса | Копировать в свой проект |
| `guidelines/`, `*.card.html` | Витрина дизайн-системы | Не нужно в проде — только для просмотра |

> `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` — **служебные, генерируются автоматически**. В прод не переносить.

---

## 1. Токены — фундамент (нужно всегда)

Подключи **один файл** — он тянет за собой все токены:

```html
<link rel="stylesheet" href="styles.css" />
```

`styles.css` = только `@import`-ы:
```
tokens/colors.css      · палитра Cream + семантические алиасы
tokens/typography.css  · системный шрифт, шкала, веса
tokens/spacing.css     · отступы, радиусы, тени, motion
tokens/base.css        · reset + утилиты (.muted .small .tnum .sec-head)
```

После этого доступны все переменные:

```css
.my-card {
  background: var(--surface-card);     /* белый */
  border-radius: var(--radius);        /* 16px */
  box-shadow: var(--shadow-card);      /* мягкая тёплая тень */
  color: var(--text-primary);
}
.my-button {
  background: var(--accent);           /* #E85D1C */
  color: var(--accent-text);
  border-radius: var(--radius-btn);    /* 12px */
}
```

Ключевые токены: `--accent`, `--accent-press`, `--accent-wash`, `--success`, `--danger`,
`--streak`, `--surface-page`, `--surface-card`, `--surface-chip`, `--text-primary`,
`--text-hint`, `--border-hairline`, `--radius` (16), `--radius-btn` (12), `--radius-input` (10),
`--radius-pill`, `--shadow-card`, `--shadow-raised`, `--medallion-1/2`.

---

## 2А. Если проект на ВАНИЛИ (как n8n-fitness-scan)

Компоненты здесь — React, но в твоём `index.html` + `main.js` Реакта нет.
**Бери не код компонентов, а их CSS-семантику.** Открой нужный `*.jsx`, посмотри
инлайн-стили и собери эквивалентный класс. Примеры готовых классов:

```css
/* Карточка */
.card { background: var(--surface-card); border-radius: var(--radius);
        box-shadow: var(--shadow-card); padding: 16px; }

/* Кнопка primary */
.btn { width: 100%; padding: 14px; border: none; border-radius: var(--radius-btn);
       background: var(--accent); color: var(--accent-text);
       font: 600 16px var(--font-base); cursor: pointer; }
.btn--secondary { background: var(--surface-chip); color: var(--text-primary); }

/* Прогресс-бар */
.bar { height: 10px; border-radius: 6px; background: var(--surface-track); overflow: hidden; }
.bar > i { display: block; height: 100%; background: var(--accent);
           border-radius: 6px; transition: width .35s var(--ease-out); }

/* Тумблер / чек-кружок / чипы — смотри components/core/Switch.jsx,
   CheckCircle.jsx, Chip.jsx и переноси стили в CSS-классы. */
```

**Иконки в ванили:** в `Icon.jsx` лежат `path`-данные (объект `RYZH_ICON_PATHS`).
Скопируй нужный `<path>` в инлайн-SVG:

```html
<svg viewBox="0 0 24 24" width="22" height="22" fill="none"
     stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round">
  <!-- вставь path нужной иконки из Icon.jsx -->
</svg>
```
Цвет иконки = цвет текста (`currentColor`), так что крась через `color:`.

**Маскот:** скопируй `assets/mascot/` в свой `img/`. Имена уже совпадают с конвенцией
проекта (`fox_m{M}_b{B}.png`). Всегда показывай лиса в тёмном медальоне:

```css
.medallion { width: 132px; height: 132px; border-radius: 50%; overflow: hidden;
  background: radial-gradient(circle at 50% 34%, var(--medallion-1), var(--medallion-2) 72%);
  box-shadow: 0 0 0 3px var(--accent), var(--shadow-raised); }
.medallion img { width: 128%; height: 128%; object-fit: cover;
  object-position: 50% 16%; margin: -6% 0 0 -14%; }
```

---

## 2Б. Если проект на REACT

1. Скопируй `components/core/*.jsx` в свой `src/components/`.
2. Замени `export function X` — он и так стандартный named export, импортируй обычным `import { Button } from '...'`.
3. Никаких внешних зависимостей у компонентов нет (только React). Стили — инлайн на CSS-переменных, поэтому достаточно подключить `styles.css` глобально.
4. `Icon.jsx` — копируй как есть, использование `<Icon name="dumbbell" size={22} />`.
5. `.d.ts` и `.prompt.md` — опционально (типы и подсказки), в рантайме не нужны.

> Компоненты намеренно «косметические» (без бизнес-логики) — это эталон вида,
> данные/состояние подключаешь свои.

---

## 3. Соответствие экранов (эталон → твой код)

| Эталон в `ui_kits/mini_app/` | Экран в n8n-fitness-scan |
|------------------------------|--------------------------|
| `Dashboard.jsx` | главный экран дашборда (`#screen-dashboard`) |
| `FoodLog.jsx` | дневник еды + «Мои продукты» |
| `Workout.jsx` | экран тренировки |
| `Scanner.jsx` | сканер штрихкода |
| `Settings.jsx` | профиль/настройки (за ⚙) |

Бери оттуда **раскладку, отступы, копирайт и поведение**, переноси на свою разметку.

---

## 4. Тон и правила (не забыть)

- Язык — неформальный русский, на «ты». Sentence case.
- **Эмодзи в интерфейсе не используем** — только линейные иконки.
- Числа — табличные цифры (`var(--tnum)` / `font-variant-numeric: tabular-nums`).
- Один акцент — оранжевый. Не плодить цвета; гармоничные оттенки — через `oklch`.
- Карточки: 16px радиус, мягкая тень, без рамки. Лис — только в тёмном медальоне.

---

## 5. Быстрый старт в Claude Code

```
«вот мой репозиторий n8n-fitness-scan. используя скилл ryzh-design,
 перепиши экран Еды: бюджет дня сверху, группировка по приёмам пищи,
 в строке одна кнопка “…” с меню. стиль и токены — из скилла.»
```

Claude прочитает `README.md` + `tokens/` + нужный эталон из `ui_kits/` и применит
к твоему коду.
