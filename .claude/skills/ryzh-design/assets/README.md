# Assets

## Mascot — «Рыж» the fox (`assets/mascot/`)

All **16 tiers** are in, named `fox_m{M}_b{B}.png` — `M` = muscle tier 0–3 (training
axis), `B` = belly tier 0–3 (nutrition axis). The art has a **dark background baked
in**, so the UI always shows the fox inside a **dark circular medallion** with a 3px
orange ring (`Medallion` in the UI kit, `--medallion-*` tokens) rather than cutting it
out.

Corners of the grid = the extreme physiques: `fox_m3_b0` sporty/ripped, `fox_m0_b3`
thin-but-belly, `fox_m3_b3` muscular-with-extra-weight, `fox_m0_b0` thin. See the
«Маскот — сетка 4×4» card in the Design System tab. Streak numbers are drawn by the UI.

**Optional, still to come:** special scenes — `fox_frozen` / `fox_win` / `fox_lost`.

## Icons

No image assets — the icon set is **vector**, drawn in `components/core/Icon.jsx`
(24×24 line icons, `currentColor`). Emoji are not used.

## No webfonts

Native system UI stack (`-apple-system, …`) — no font binaries. See `tokens/typography.css`.
