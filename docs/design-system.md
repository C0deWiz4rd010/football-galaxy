# Football Galaxy — Design System & WM 2026 Spec

> Single source of truth for the mobile-first visual language, theming, layout
> rules, component anatomy, and the complete World Cup 2026 feature
> specification. Structural tokens live in
> [`src/shared/styles/tokens.css`](../src/shared/styles/tokens.css); colour
> tokens live in [`src/index.css`](../src/index.css). This document explains how
> to use them and the rules every page must follow.

---

## 1. Principles

1. **Mobile-first.** Author base styles for a 360–414px phone, then layer
   `sm`/`md`/`lg`/`xl` enhancements. Never start from desktop and shrink down.
2. **One plane, aligned edges.** Cards in the same row share height, radius,
   padding, and baseline. Stat rows are pinned to the bottom (`mt-auto`) so they
   line up across cards of different content length.
3. **Token-driven.** Use `fg-*` tokens for radius, spacing, elevation, motion,
   and z-index. No ad-hoc `rounded-[1.6rem]` / `p-3.5` values in new or touched
   code.
4. **Calm, cohesive colour.** One brand accent per theme, neutral surfaces,
   semantic colours reserved for status only.
5. **Honest states.** Every data surface ships loading, empty, and error states.
6. **Accessible.** ≥44px tap targets, visible focus ring, AA contrast, full
   `prefers-reduced-motion` support.

---

## 2. Breakpoints (mobile-first)

| Token | Min width | Primary use |
| ----- | --------- | ----------- |
| base  | 0         | Phone portrait — single column |
| `sm`  | 640px     | Large phone / 2-up stat tiles |
| `md`  | 768px     | Tablet — sidebar appears, 2-col content |
| `lg`  | 1024px    | Small laptop — 2–3 col grids |
| `xl`  | 1280px    | Desktop — full multi-rail dashboards |

Content max-width is `var(--fg-content-max)` = **1280px**. Reading-width panels
use `var(--fg-content-narrow)` = **768px**.

---

## 3. Colour system

Colour is expressed as HSL CSS variables in [`src/index.css`](../src/index.css)
and consumed through the Tailwind semantic names (`bg-background`,
`text-foreground`, `border-border`, `bg-primary`, …).

### 3.1 Semantic roles

| Role | Token | Meaning |
| ---- | ----- | ------- |
| Canvas | `--background` | App background |
| Text | `--foreground` | Primary text |
| Surface | `--card` | Card / panel fill |
| Brand | `--primary` | Primary actions, active nav, highlights |
| Muted | `--muted` / `--muted-foreground` | Secondary surfaces & text |
| Accent | `--accent` | Soft tinted backgrounds |
| Border | `--border` | Hairlines & dividers |
| Ring | `--ring` | Focus ring |
| Danger | `--destructive` | Errors / destructive |

### 3.2 Status colours

Each status has a **fill** (`bg-success/12`, `border-warning/40`, chart
fills) and a **readable text tone** `*-fg` that keeps ≥ 4.5:1 on cards in both
modes. Never put `text-emerald-200`-style palette shades on surfaces: they
vanish in light mode.

| Status | Fill (light / dark) | Text `*-fg` (light / dark) | Use |
| ------ | ------------------- | ------------------------- | --- |
| `success` | `152 62% 38%` / `152 58% 52%` | `152 72% 24%` / `152 62% 72%` | wins, qualified, top form |
| `warning` | `38 92% 48%` / `40 96% 60%` | `30 90% 30%` / `43 96% 72%` | watch, pending, trophies |
| `danger` | `--destructive` | `350 75% 38%` / `350 90% 80%` | losses, errors, cold form |
| `info` | `212 85% 44%` / `212 92% 66%` | `212 85% 36%` / `210 92% 80%` | neutral highlights, 2nd series |
| `live` | `350 85% 52%` / `350 90% 64%` | — | live pulse |
| `zone-ucl` / `zone-rel` | `217 91% 58%` / `0 80% 58%` | — | table zones |

### 3.3 Data-driven colours (clubs, leagues)

Club and league colours come from the APIs and can be anything from white to
near-black. Rules:

- Never use them as text colour on our surfaces.
- Text **on** them uses `readableTextOn(color)` (`src/lib/color.ts`).
- Club-colour heroes (team page) always get a dark scrim and white text, so
  white kits (Real Madrid, Tottenham) stay readable.
- Generated crests/avatars fall back to `FALLBACK_TEAM_COLORS`
  (`src/lib/visualAssets.ts`).

### 3.4 World Cup host accents

`USA 213 70% 46%` · `Canada 0 72% 50%` · `Mexico 150 60% 35%`. Used for
host-nation chips and the hero band gradient.

### 3.5 Charts

One chart library: **Recharts**. Every chart takes its colours, axis ticks,
tooltip and legend from `src/components/charts/chartTheme.ts` (CSS variables,
so palette and mode switch without re-render). Series order: `primary`, then
`secondary` (info hue — never another green next to the green light-mode
primary). Radars use the shared `ProfileRadar` (0–100 scale, dashed reference
shape = league median or second player).

---

## 4. Theming — multi-theme system

Two independent dimensions:

- **Mode** — `light` / `dark`, owned by `next-themes` via the `.dark` class.
- **Palette** — the brand accent family, owned by a `data-palette` attribute on
  `<html>` (`PaletteContext`, persisted to `localStorage`).

A theme = **mode × palette**. Palettes override only the brand-facing tokens
(`--primary`, `--primary-foreground`, `--ring`, `--league-accent`,
`--league-accent-soft`) for both light and dark; neutrals/surfaces stay shared
so every palette keeps the same calm structure.

### Theme catalogue

| Palette | Identity | Light primary (HSL) | Dark primary (HSL) |
| ------- | -------- | ------------------- | ------------------ |
| **Galaxy** (default) | Deep green + gold signature | `155 65% 24%` | `43 92% 61%` |
| **Midnight** | Indigo / electric blue | `222 60% 42%` | `217 91% 68%` |
| **Aurora** | Teal / cyan | `188 75% 32%` | `176 70% 55%` |
| **Stadium** | Floodlit pitch green | `142 64% 30%` | `142 70% 55%` |
| **Crimson** | Matchday red / burgundy | `348 78% 42%` | `350 90% 65%` |
| **Mono** | Neutral high-contrast | `220 14% 24%` | `210 20% 90%` |

Users pick palette + mode in **Settings** (`/settings`) via the visual
`ThemePicker`. The header keeps a quick light/dark toggle. Defaults: Galaxy /
dark.

---

## 5. Typography

Font: **Inter**, self-hosted via `@fontsource/inter` (weights 400–700; there is
no 900, so never use `font-black`). Tabular figures are on for every
`<table>`; elsewhere add `tabular-nums` to numbers that change or align.
`font-mono` is the system UI mono stack (scores, KPI values).

Scale: Tailwind's `text-xs … text-5xl` plus `text-2xs` (11px) — the smallest
allowed size, only for dense badges/labels. No arbitrary `text-[Npx]`.

Headings: `font-semibold tracking-tight`. Eyebrow labels:
`text-2xs|text-xs uppercase tracking-eyebrow text-muted-foreground`.

One `<h1>` per page, owned by the page (the header shows the route title as
plain text). `PageSection headingAs="h1"` and `NotFoundState headingAs="h1"`
cover pages without a hero.

---

## 6. Spacing, radii, elevation, motion, layers

All values live in `src/shared/styles/tokens.css`; Tailwind exposes them.

- **Spacing** — 4px scale (`p-fg-1…12`) alongside Tailwind's default scale.
- **Radii** — one scale: `rounded-xs` 6 · `sm` 8 · `md` 12 (buttons, inputs,
  tiles) · `lg` 16 (**cards**) · `xl` 24 (**hero/panels, shell chrome**) ·
  `2xl` 32 · `full`. No `fg-` prefixed or arbitrary radii.
- **Opacity** — Tailwind steps plus 2/3/4/6/8/12/18 for glass surfaces. Tint
  surfaces with `bg-foreground/N` (works in both modes), not `bg-white/N`
  (only allowed on media/club-colour backgrounds).
- **Elevation** — `shadow-fg-1…5`. Cards rest at `fg-1`/`fg-2`; dialogs at
  `fg-4`/`fg-5`.
- **Motion** — one scale, mirrored in `src/shared/motion/tokens.ts`:
  `duration-fg-{instant 120, fast 180, base 240, slow 320, hero 420}`,
  `ease-fg-{standard, enter, soft, exit}`. All durations collapse to 0 under
  reduced motion. Route transitions are animated once by the shell; pages do
  not add their own entrance animation.
- **Layers** — `z-sticky` 10 · `z-header` 30 · `z-nav` 40 · `z-fab` 45 ·
  `z-modal` 50 · `z-banner` 60 · `z-toast` 70 · `z-tooltip` 80. No `z-[N]`.
- **Shell geometry** — `--fg-shell-gutter` 12px, `--fg-sidebar-width` 256px,
  `--fg-header-height` 64px, `--fg-tabbar-height` 64px. Derived offsets:
  `ml-shell` (content next to the sidebar), `top-header-offset` (sticky
  sub-navs below the header), `pb-tabbar-clearance` (content above the mobile
  tab bar, safe-area aware), `max-w-shell` (1440px rail).

---

## 7. Layout primitives

Use these instead of hand-rolling grids so alignment stays consistent.

- **`PageSection`** — vertical rhythm wrapper with an optional eyebrow + title +
  action. Standard `space-y` between sections.
- **`MetricTile`** — the canonical KPI tile: label (eyebrow) · value (mono 2xl)
  · helper, stacked so long labels never collide with the value; `onMedia`
  for club-colour heroes.
- **`BackButton`** — the only back control (44px); goes back in history or to
  `fallbackTo` on deep links. `variant="icon"` for heroes.
- **`ErrorState` / `NotFoundState`** — shared failure and not-found states.
- **`ProfileRadar`**, **`chartTheme`** — see §3.5.

### App shell

| Region | Mobile | Desktop |
| ------ | ------ | ------- |
| Sidebar | hidden | fixed left, `w-sidebar` (256px), `rounded-2xl` |
| Header | sticky, hamburger, quick theme/search | sticky, offset by sidebar |
| Nav | bottom `MobileTabBar`, safe-area aware | sidebar nav |
| Content | single column, `pb-tabbar-clearance` | `ml-shell`, `max-w-shell` (1440px) |

All fixed panels respect `env(safe-area-inset-*)`.

---

## 8. Component anatomy

- **Card** — `rounded-lg`, `border-border/55`, surface fill, `p-fg-4`,
  `shadow-fg-1`. Interactive cards add `.interactive-card` (hover lift, active
  press, focus ring).
- **Stat tile** — eyebrow (xs uppercase) · value (xl/2xl tabular) · caption (xs
  muted) — use `MetricTile`. Equal height in a grid row.
- **Badge / pill** — `rounded-full`, `app-pill` for glass chips.
- **Table / list** — desktop = table, mobile = stacked rows; both use tabular
  numerals and aligned numeric columns.
- **Tabs / section nav** — horizontal scroll on mobile (`overflow-x-auto`,
  hidden scrollbar), active underline/fill, ≥44px targets.
- **States** — loading skeletons match final layout; empty = dashed border +
  guidance; error = message + retry.

---

## 9. WM 2026 — World Cup 2026 feature spec

The World Cup area is a **standalone command centre** at `/world-cup-2026`,
intentionally separate from club leagues (national-team data only — its links
never cross into club pages). Data comes from football-data.org (competition
`WC`) with a labelled snapshot fallback. Free tier provides groups A–L, the 104
fixtures (HT/FT scores, referees), 48 teams (official crests) and 26-player
squads; it has **no** lineups/events/match-stats/photos/venues, so those areas
show honest empty-state copy.

### 9.1 Information priority (why the layout is ordered this way)

A visitor must, within one screen, understand: *Is anything live? What's the
single most relevant match? What's next? How do I reach groups / bracket /
teams?* The Overview is ordered top-to-bottom by that priority.

### 9.2 Routes

| Route | Page |
| ----- | ---- |
| `/world-cup-2026` | Overview / command centre |
| `/world-cup-2026/matches` | Full schedule + filters |
| `/world-cup-2026/groups` | 12 group tables A–L |
| `/world-cup-2026/bracket` | Knockout board |
| `/world-cup-2026/teams` | National-team directory |
| `/world-cup-2026/match/:matchId` | Match centre |
| `/world-cup-2026/team/:teamId` | Team profile |

### 9.3 Section nav

Sticky under the header. Tabs: Overview · Matches · Groups · Bracket · Teams.
Horizontal scroll on mobile with active fill; ≥44px targets; the active route is
always visible (auto-scrolls into view).

### 9.4 Overview composition (top → bottom)

1. **Hero** — tournament name; host flags USA / Canada / Mexico (host-accent
   gradient band); start–end dates with a live countdown; host-city count; a
   LIVE match-count badge; a data-quality badge (live / official / snapshot).
   Mobile: stacked, centred. Desktop: horizontal band.
2. **Tournament status** — stat tiles in a grid (`2-col` mobile →
   `4-col` md+), equal height: **48 teams · 104 matches · 12 groups · host
   cities · days-to-kickoff / live now**.
3. **Priority rail** — three cards (1-col mobile → custom `xl` 3-track):
   - **Feature match** — chooses live → else next scheduled → else latest
     result. Shows both crests, score with HT/FT breakdown, a status pill
     (LIVE+minute / kickoff time / FT), referee, and a "match centre" link.
   - **Upcoming** — compact next-N list (date, time, crests).
   - **Status detail** — countdown + quality reiterated for scanning.
4. **Groups preview** — condensed A–L leaders, full width, links to Groups.
5. **Secondary rail** (1-col mobile → `xl` 3-track): **Bracket preview** ·
   **Host cities** (grouped by country) · **Team spotlight** (group leader).
6. **Teams strip** — first 8 national teams (`2-col` sm → `4-col` xl).

### 9.5 Matches page

Filter bar (status · team · group · round) + a "showing X of Y" counter + "live
refreshes every 15s" note. Match cards in a grid (`1-col` mobile → `2-col` lg),
equal height. Empty/reset states when filters exclude everything or no fixtures
are published.

### 9.6 Groups page

Qualification legend (top-2 zone · best-third watch · pending) then the 12 group
tables in a grid (`1-col` mobile → `3-col` xl). Each table: 4 teams, columns
Rank · P · GD · Pts, with a colour hint for the qualification zone. Equal height
across the row.

### 9.7 Bracket page

Knockout board built **live** from group results (no placeholder fixtures).
Mobile = vertical round-by-round scroll; desktop = horizontal columns
(R32 → R16 → QF → SF → Final). Empty-state until results exist.

### 9.8 Teams page

Search + group filter + a group rail (A–L). Team cards (crest, name, 3-letter
code, group) in a grid (`2-col` sm → `3/4-col`). National-team links only.
"Showing X of Y" counter.

### 9.9 Match centre `/match/:id`

Score breakdown (HT/FT), meta grid (date · venue · referee · round · group).
Lineups / events / match-stats render honest empty-state copy on the free tier.

### 9.10 Team profile `/team/:id`

Crest, group, coach, squad grouped by position with ages. Photo gaps show a
generated avatar / empty-state.

### 9.11 Behaviour

- Refetch: matches every **15s**, everything else every **60s**.
- Live-first; snapshot fallback always labelled via the shared
  `DataSourceBadge` (live / official / snapshot / offline).
- All pages standardise loading / empty / error.

---

## 10. Definition of done (per surface)

- [ ] Mobile-first: authored base-up, no horizontal scroll at 360px.
- [ ] Cards in a row share height, radius (`fg-lg`), padding (`fg-4`), baseline.
- [ ] Only `fg-*` tokens for radius / spacing / elevation / motion.
- [ ] Loading + empty + error states present.
- [ ] ≥44px tap targets, visible focus ring, AA contrast in every theme.
- [ ] Works in all six palettes × light/dark.
- [ ] `npm test`, `npm run lint`, `npm run build` green.
