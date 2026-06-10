# Ryzh Fitness — Design System

A design system reverse-engineered from **Рыж** ("Ryzh"), a Telegram Mini App
fitness tracker. The app is a single-user calorie/macro + workout companion to a
Telegram bot: scan a barcode → log food, tick off exercises, keep your 🔥 streaks,
and watch a fox mascot get buffer (or pudgier) based on how you eat and train.

> **Ryzh** (Рыж) ≈ "Ginger/Reddy" — the fox mascot. The product has no separate
> wordmark; the fox + the warm orange **«Cream»** palette *is* the brand.

---

## Sources

This system was built by reading the **frontend codebase** (read-only, mounted):

- **`n8n-fitness-scan/`** — the live Mini App. Vanilla HTML/JS/CSS, no build step,
  hosted on GitHub Pages (`https://perevyazko1.github.io/n8n-fitness-scan/`).
  - `index.html` — all screens as `.screen` divs toggled by `showScreen()`.
  - `main.js` (~1240 lines) — all logic: tabs, dashboard, food log, workout toggles,
    ZXing barcode scanner, Open Food Facts lookup, settings.
  - `styles.css` — the entire visual system (the basis for our tokens).
  - `CLAUDE.md` — extensive product/architecture notes (phases, webhook contracts).
  - `img/README.md` — mascot naming convention (the PNGs themselves are **not** in
    the repo).
- **Backend** (referenced, not provided): an n8n → (migrating to) Django API at
  `https://n8n-fitness.ru/api`, Google-Sheets-backed. Not needed for design.

No Figma file was provided. No webfonts or image binaries exist in the repo.

---

## Content fundamentals

The product speaks **Russian**, informal and warm — like a gym buddy, not an app.

- **Voice:** second person, familiar **"ты"** ("Наведи камеру на штрихкод", "Съел Nг",
  "Впиши название"). Imperatives are friendly, never barked.
- **Tone:** playful + encouraging, with light gamification. Rest day reads
  "Сегодня отдых 😌"; a logged workout is "Тренировка выполнена ✅".
- **Casing:** sentence case everywhere. Section heads in the workout list are the one
  UPPERCASE exception (e.g. «СИЛОВАЯ»), letter-spaced.
- **Numbers & units:** terse, abbreviated — «1444 ккал», «Б17 · Ж5 · У3» (Белки/Жиры/
  Углеводы = protein/fat/carbs), «4×8-10 · 60кг». Tabular figures so stats line up.
- **Emoji:** YES — emoji are load-bearing, not decoration. 🔥 streaks, 🏋️ workout,
  🍽️ food, 😌 rest, ✅ done, ❄️ frozen streak, 🦊 the mascot. Use them as the app does.
- **Status/feedback:** short confirmations with a trailing check — «Сохранено ✓»,
  «Добавлено в дневник ✓», «КБЖУ пересчитаны ✓». Errors are plain: «Не вышло: …».
- **Vibe:** efficient, single-user, no marketing fluff. Every string does a job.

Example strings (verbatim): «Сегодня тренировка», «осталось 1444», «Завершить
тренировку», «В этот день ничего не залогировано.», «Доступ закрыт».

---

## Visual foundations

A **warm, friendly, light** look — codename **«Cream»**. ONE theme (no light/dark
split) and **no Telegram theme deferral**: the brand sets its own colour so it looks
identical in any host. The whole palette is built around the **orange of the fox's
fur**. Concrete tokens live in `tokens/`.

- **Color:** one **brand orange** (`#E85D1C`, press `#C24A12`) as the single accent —
  primary button, active tab, switches, progress fills, focus. **Amber** (`#F0972A`)
  warms the streak flame; **green** (`#2FA866`) = success/«в норме»; **warm red**
  (`#D8442A`) = over-budget/delete. Everything else is a **warm neutral ramp**: cream
  page (`#FBF4EA`), white cards, sand borders. Accents stay sparing — colour earns
  attention.
- **Type:** the **native system stack** (`-apple-system, Segoe UI, Roboto…`). No
  webfonts. Scale tops out at 22px (page titles & big stat numbers, weight 700–800);
  body is 16px; meta 12–13px. Tabular numerals for all stats.
- **Spacing:** dense and mobile-first. 16px page gutters and card insets, 10–14px gaps
  between cards/rows, content capped at 560px. 44px minimum tap targets.
- **Backgrounds:** flat fills. Page is warm cream (`#FBF4EA`); cards are pure **white**
  to lift off it. **No gradients in the chrome** — the only gradients are the dark
  **mascot medallion** and the camera scrim on the scanner.
- **Cards:** the signature element — white fill, **16px radius**, 16px inset, 8px
  internal gap, **no border**, and a **soft warm shadow** (`--shadow-card`,
  `0 2px 10px rgba(120,90,40,.06)`) so they float on the cream page. Buttons use a
  **12px radius**, inputs **10px**.
- **Borders:** minimal — a sand hairline on inputs and the tab-bar top edge; the
  frozen-streak badge gets a 1.5px inset blue ring. Depth comes from the soft shadow,
  not heavy strokes.
- **Shadows:** soft and warm, not flat-grey. `--shadow-card` on resting cards,
  `--shadow-raised` on the mascot medallion / modals, plus the switch knob and the
  scanner viewfinder's `0 0 0 9999px` mask.
- **Corners:** 16px (cards/rows) · 12px (buttons) · 10px (inputs) · full-round (chips,
  switches, icon buttons, day-nav arrows, the manual-entry pill).
- **Mascot medallion:** the fox always sits in a **dark circular medallion**
  (`radial-gradient` of `--medallion-1`→`--medallion-2`) with a **3px orange ring**.
  This lets the dark-background fox art read cleanly on the light UI **without
  cutting it out**.
- **Motion:** subtle and functional. Progress bars fill over **0.35s ease**; switches
  & fades **0.2s**; press feedback is a quick **scale(0.92)** on icon buttons (0.1s).
  Tab changes do a 4px `translateY` **fadeIn**. No bounces, no parallax, no decorative
  loops.
- **States:** touch-first (hover barely used); **press** = subtle wash or scale.
  Disabled = **opacity 0.5**. Active tab/segment/chip = filled orange + semibold.
  Toggled-done exercise = strikethrough + 0.5 opacity.
- **Imagery:** the only imagery is the **mascot** — a warm fox illustration that morphs
  across a 4×4 muscle×belly grid, shown inside the medallion. No photography.

---

## Iconography

The icon system is a **bespoke line set** drawn as SVG (`components/core/Icon.jsx`),
24×24, `currentColor` stroke ~1.8px, rounded caps. **Emoji are no longer used** in the
UI — they were the old Telegram-era approach; the Cream design replaces them with these
geometric line icons that tint with text colour.

- **Navigation:** `home` (Главная) · `meal` (Еда, bowl) · `dumbbell` (Трен) ·
  `scan` (Сканер, barcode viewfinder).
- **Meaning / status:** `flame` (streak — supports `fill`) · `snowflake` (frozen
  streak) · `check` (done) · `lock` (locked) · `leaf` (rest/recovery) · `trophy` (goal).
- **Controls:** `settings` (sliders) · `chevronLeft` / `chevronRight` (day nav) ·
  `plus` (add) · `repeat` (повторить) · `edit` (pencil) · `close` (delete/close).
- **Colour by role:** `var(--accent)` for active, `var(--text-hint)` for idle,
  `var(--streak)` on the flame, `var(--success)` on a check, `var(--danger)` on delete.
- **Usage:** `<Icon name="dumbbell" size={22} />`. Pass `title` to make it semantic.
  The full set + names are in `guidelines/brand-iconography.card.html` and `RyzhIconNames`.

> Need an icon that isn't in the set? Add it to `RYZH_ICON_PATHS` in `Icon.jsx` in the
> same geometric, rounded, single-weight style — don't fall back to emoji.

---

## What's in here (index / manifest)

| Path | What |
|------|------|
| `styles.css` | Entry point — `@import`s every token + base file. Link this. |
| `tokens/colors.css` | Pinned Telegram light palette + `.theme-dark` scope + accents. |
| `tokens/typography.css` | System font stack, type scale, weights. |
| `tokens/spacing.css` | Spacing, radii, control sizes, the few shadows, motion. |
| `tokens/base.css` | Reset + text utilities (`.muted`, `.small`, `.tnum`, `.sec-head`). |
| `guidelines/*.card.html` | Foundation specimen cards (Colors, Type, Spacing, Brand). |
| `components/core/` | React primitives (see below). |
| `ui_kits/mini_app/` | Interactive Mini App recreation (Dashboard/Food/Workout/Scanner). |
| `assets/` | Asset notes + mascot README. **⚠ Fox PNGs missing — see below.** |
| `SKILL.md` | Agent-Skill manifest for downloadable use. |

### Components (`components/core/`)

`Button` · `Card` + `CardStatHead` · `ProgressBar` + `MacroRow` · `Switch` ·
`CheckCircle` · `Chip` + `ChipRow` · `SegmentedControl` · `StreakBadge` · `TabBar` ·
`Input` + `Select` · `Icon`.

Each ships `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and a shared `*.card.html`
demo per concern (Buttons / Selection / Data / Forms & Tab bar). Consume via the
compiled bundle: `const { Button } = window.RyzhFitnessDesignSystem_eec584`.

### UI kit (`ui_kits/mini_app/`)

`index.html` mounts an interactive iPhone-framed recreation: tap the bottom tabs to move
between the **dashboard**, **food diary** (with a Дневник/Мои продукты segmented
control), **workout** (block chips + exercise switches you can toggle), and the
**scanner** viewfinder. Built from the real `styles.css` + the DS components.

---

## ⚠ Caveats / open items

1. **Mascot art — all 16 tiers in.** `assets/mascot/fox_m{0..3}_b{0..3}.png` are wired
   into the dashboard, the empty-state, and the Mascot cards inside the dark medallion.
   The corners give the extreme physiques (sporty / thin / belly / buff-with-weight).
   Optional `frozen` / `win` / `lost` scenes are still to come. Note the source art has a
   **dark background baked in** — that's why we use the medallion rather than cutting it out.
2. **Single «Cream» theme by design.** We dropped the light/dark split and the Telegram
   `--tg-theme-*` deferral so the brand looks consistent everywhere. If you ever need to
   respect the Telegram host theme again, that would be a separate adapter layer.
3. **Orange is the brand hex we chose** (`#E85D1C`), sampled to match the fox. If you
   have an official brand orange, send it and we'll reconcile in one place (`tokens/colors.css`).
4. **No wordmark / logo.** None exists. If one is wanted, it needs to be designed.
5. **System fonts only** — no webfonts to ship; nothing to substitute.
