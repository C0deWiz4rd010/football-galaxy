# 16 — Mobile-First Redesign, Design System & Multi-Theme

Status: in progress · Owner: Football Galaxy

## Goal

Make the whole app mobile-first (excellent on phone, perfect on desktop),
formalise a design system ([`docs/design-system.md`](../design-system.md)),
enforce consistent card alignment, self-host Inter, and add a multi-theme system
(Galaxy / Midnight / Aurora / Stadium / Crimson / Mono) selectable in a new
Settings area. Fully (re)build the WM 2026 feature to the spec in the design
system doc.

## Confirmed decisions

- Font: self-host Inter via `@fontsource/inter`.
- Palette: refine the Galaxy palette **and** add new palettes, user-selectable in
  Settings (mode × palette). Defaults Galaxy / dark.
- Doc: single [`docs/design-system.md`](../design-system.md) (system + WM spec +
  theme catalogue).
- Reach: whole app refactored to the token system in one pass.
- Scope: styling / layout / primitives / theme / font / Settings — **not** the
  data layer (data stays football-data.org live + snapshot).

## Phases & commits

1. **Docs** — design-system.md + renumber/restructure plans. → `docs:`
2. **Font** — self-host Inter; load in entry. → `feat(theme):`
3. **Colour + palettes** — refine tokens, add 6 palettes (light+dark brand
   overrides), status colours, WM host accents. → `feat(theme):`
4. **Multi-theme system** — `PaletteContext`, `data-palette`, wire into
   providers; keep next-themes for mode. → `feat(theme):`
5. **Settings** — `/settings` page + `ThemePicker` + nav entries (sidebar,
   mobile menu, header). → `feat(settings):`
6. **Primitives** — `PageSection`, `CardGrid`, `StatCard`. → `feat(ui):`
7. **Shell** — Header / Sidebar / MobileTabBar / AppLayout mobile-first,
   safe-area, consistent radii. → `refactor(layout):`
8. **WM 2026** — rebuild every page/component to spec. → `feat(world-cup):`
9. **Remaining pages** — tokenise radii/padding/gap across dashboards &
   explorers. → `refactor(ui):`
10. **Verify** — test / lint / build + responsive QA sweep.

## Verification

- `npm test`, `npm run lint`, `npm run build` green.
- Manual QA at 360 / 390 / 768 / 1024 / 1280 / 1440px: equal-height &
  edge-aligned cards, single radius scale, no overflow, ≥44px targets, safe-area
  respected.
- All six palettes × light/dark contrast-checked.
- WM live refresh + snapshot fallback both verified.
