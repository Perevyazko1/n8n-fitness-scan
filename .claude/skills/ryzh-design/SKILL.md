---
name: ryzh-design
description: Use this skill to generate well-branded interfaces and assets for Ryzh (Рыж) — a Telegram Mini App fitness tracker — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation

- **What it is:** a Russian-language, single-user Telegram Mini App for calorie/macro +
  workout tracking, with a fox mascot («Рыж») and streak gamification.
- **Link `styles.css`** for all tokens (single warm **«Cream»** theme — no light/dark).
- **Colors:** brand **orange** `#E85D1C` (single accent), amber `#F0972A` (streak),
  green `#2FA866` (success), warm red `#D8442A` (danger). Cream page `#FBF4EA`, white
  cards with a soft warm shadow.
- **Type:** native system stack, no webfonts. Tabular numerals for stats.
- **Cards:** 16px radius, soft shadow, no border. Buttons 12px, inputs 10px. Pills full-round.
- **Icons:** bespoke **line set** via `<Icon name="…" />` — NO emoji. Names: home, meal,
  dumbbell, scan, flame, snowflake, check, lock, leaf, trophy, settings, chevronLeft/Right,
  plus, repeat, edit, close.
- **Mascot:** fox art always sits in a **dark circular medallion** with a 3px orange ring.
- **Voice:** informal Russian, "ты", sentence case.
- **Components:** `window.RyzhFitnessDesignSystem_eec584` (Button, Card, ProgressBar,
  MacroRow, Switch, CheckCircle, Chip, SegmentedControl, StreakBadge, TabBar, Input, Select, Icon).

## Files

- `README.md` — full guide: content fundamentals, visual foundations, iconography, index.
- `styles.css` + `tokens/` — link these; CSS custom properties for everything.
- `components/core/` — React primitives (`.jsx` + `.d.ts` + `.prompt.md` each), incl. the line-icon `Icon`.
- `ui_kits/mini_app/` — interactive iPhone-framed recreation of the app (Cream theme).
- `guidelines/` — foundation specimen cards.
- `assets/mascot/` — all 16 fox renders `fox_m{0..3}_b{0..3}.png` + naming notes.
- `INTEGRATION.md` — how to wire this system into a real codebase (e.g. n8n-fitness-scan).
