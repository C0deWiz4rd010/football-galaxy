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

### 3.2 Status colours (semantic, fixed across themes)

| Status | Light | Dark | Use |
| ------ | ----- | ---- | --- |
| Success | `152 62% 38%` | `152 58% 52%` | wins, live-OK, qualified |
| Warning | `38 92% 48%` | `40 96% 60%` | watch / pending |
| Danger | `0 72% 50%` | `0 75% 60%` | losses, errors |
| Info | `212 90% 50%` | `212 92% 66%` | neutral highlights |
| Live | `350 85% 55%` | `350 90% 64%` | live match pulse |

### 3.3 League brand colours (unchanged)

`pl #3d195b` · `bl #d3010c` · `ll #003f8f` · `sa #009246` · `l1 #091c3e`.

### 3.4 World Cup host accents

`USA 213 70% 46%` · `Canada 0 72% 50%` · `Mexico 150 60% 35%`. Used for
host-nation chips and the hero band gradient.

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

Font: **Inter**, self-hosted via `@fontsource/inter` (offline-friendly for
static Hostinger hosting). Numeric data uses `font-feature-settings: "tnum"`
(tabular figures) for column alignment.

Modular scale (1rem base × 1.25), tokens in `tokens.css`:

| Token | Size | Typical use |
| ----- | ---- | ----------- |
| `--fg-font-size-xs` | 12px | meta / labels |
| `--fg-font-size-sm` | 14px | body small / table |
| `--fg-font-size-base` | 16px | body |
| `--fg-font-size-md` | 18px | card titles |
| `--fg-font-size-lg` | 20px | section titles |
| `--fg-font-size-xl` | 24px | page titles (mobile) |
| `--fg-font-size-2xl` | 30px | page titles (desktop) |
| `--fg-font-size-3xl–5xl` | 36–60px | hero |

Headings: `font-semibold tracking-tight`. Eyebrow labels:
`text-[10px] uppercase tracking-[0.18em] text-muted-foreground`.

---

## 6. Spacing, radii, elevation, motion

- **Spacing** — 4px scale (`--fg-space-1…12`). Card padding = `fg-4` (16px) on
  mobile, may grow to `fg-5` on `sm+`. Grid gaps = `fg-3` (12px) mobile, `fg-4`
  (16px) `md+`.
- **Radii** — `fg-xs` 6 / `fg-sm` 8 / `fg-md` 12 / `fg-lg` 16 (**cards**) /
  `fg-xl` 24 (**panels/hero**) / `fg-2xl` 32 (page wrappers) / `fg-pill`.
  **Rule:** cards = `rounded-fg-lg`, panels/hero = `rounded-fg-xl`. No bespoke
  values.
- **Elevation** — `fg-1…5`. Cards rest at `fg-1`/`fg-2`; dialogs at `fg-4`/`fg-5`.
- **Motion** — durations `fg-instant…hero`; eases `fg-standard` (state) /
  `fg-emphasized` (entrance). All collapse to 0ms under reduced-motion.

---

## 7. Layout primitives

Use these instead of hand-rolling grids so alignment stays consistent.

- **`PageSection`** — vertical rhythm wrapper with an optional eyebrow + title +
  action. Standard `space-y` between sections.
- **`CardGrid`** — responsive grid with standard gaps and equal-height items
  (`auto-rows-fr`); `cols` prop maps to a mobile-first column ramp
  (e.g. `1 → sm:2 → xl:4`).
- **`StatCard`** — the canonical tile: `flex flex-col h-full rounded-fg-lg p-fg-4`,
  eyebrow + value + caption, value pinned via `mt-auto`.

### App shell

| Region | Mobile | Desktop |
| ------ | ------ | ------- |
| Sidebar | hidden | fixed left, `var(--fg-sidebar-width)` 288px, `rounded-fg-xl` |
| Header | sticky, hamburger, quick theme/search | sticky, offset by sidebar |
| Nav | bottom `MobileTabBar`, safe-area aware | sidebar nav |
| Content | single column, `pb` for tab bar + safe-area | centred ≤1280px |

All fixed panels respect `env(safe-area-inset-*)`.

---

## 8. Component anatomy

- **Card** — `rounded-fg-lg`, `border-border/55`, surface fill, `p-fg-4`,
  `shadow-fg-1`. Interactive cards add `.interactive-card` (hover lift, active
  press, focus ring).
- **Stat tile** — eyebrow (xs uppercase) · value (xl/2xl tabular) · caption (xs
  muted). Equal height in a `CardGrid`.
- **Badge / pill** — `rounded-fg-pill`, `app-pill` for glass chips.
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
2. **Tournament status** — stat tiles in a `CardGrid` (`2-col` mobile →
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
