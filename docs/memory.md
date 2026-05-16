# Football Galaxy — Development Memory

This file tracks implementation steps, decisions, and lessons learned across sessions.

---

## Session: 2026-05-16 — feature/region-and-node-progression

### Goals
1. Fix club crest and player image display (all teams had the same league color).
2. Implement node-level region progression system (Galaxy Map feature).

---

### Fix: Team Crest Colors (mock data)

**Problem:** All teams in a given league used `league.color` as their primary color, making all generated SVG crests identical in appearance.

**Solution:**
- Added optional `teamColors?: string[]` to `CreateMockLeagueOptions` in `src/data/mock/createMockLeague.ts`.
- Each league file (`premier-league.ts`, `bundesliga.ts`, `la-liga.ts`, `serie-a.ts`, `ligue-1.ts`) now exports a `teamColors` array inspired by the real-world club colors.
- The `crest`, `primaryColor`, and player `photo` avatars now use the team-specific color.
- Result: visually distinct crests per team, even in local fallback mode.

**Files changed:**
- `src/data/mock/createMockLeague.ts`
- `src/data/mock/premier-league.ts`
- `src/data/mock/bundesliga.ts`
- `src/data/mock/la-liga.ts`
- `src/data/mock/serie-a.ts`
- `src/data/mock/ligue-1.ts`

---

### Feature: Galaxy Map — Region & Node Progression

**Route:** `/galaxy`

**Architecture:**
```
src/features/galaxy-map/
  types.ts          — GalaxyNode, Region, NodeProgress, GalaxyProgress types
  data.ts           — Static region + node definitions with lore texts for all 5 leagues
  context.tsx       — GalaxyProvider + useGalaxy hook (localStorage persistence)
  GalaxyMapPage.tsx — Main UI: region tabs, node cards grid, detail panel
```

**Key design decisions:**
- Each node has 3 levels. `levelCosts[i]` = XP to reach level `i+1`.
- `levelRewards[i]` = rewards for reaching level `i+1` (XP gain, badge, lore entry).
- Region milestones trigger when `N` nodes reach `minLevel`. Milestones grant passive bonuses and lore.
- Progress is stored in `localStorage` as `football-galaxy-map-progress`.
- XP is currently earned via demo buttons; future: tie into match events or challenge completions.
- The `GalaxyProvider` wraps the entire app via `src/app/providers.tsx`.

**Lore:**
- Every region has an `entryLore` (shown when opening the region) and `completionLore` (when all nodes maxed).
- Each node can unlock individual lore entries as rewards.

**Files created:**
- `src/features/galaxy-map/types.ts`
- `src/features/galaxy-map/data.ts`
- `src/features/galaxy-map/context.tsx`
- `src/features/galaxy-map/GalaxyMapPage.tsx`

**Files changed:**
- `src/app/providers.tsx` — added `GalaxyProvider`
- `src/app/router.tsx` — added `/galaxy` route, lazy import, layout title entry
- `src/components/layout/Sidebar.tsx` — added Galaxy Map nav link (Globe2 icon, amber highlight)

---

### Other changes

- **README.md** — Updated with Galaxy Map section and revised project structure.
- **.gitignore** — Added `build.log`, `build_log.txt`, `.vscode/`.
- **`src/shared/ui/brand-logo.tsx`** — Subtitle prop, refreshed SVG logo colors.
- **`src/components/layout/Sidebar.tsx`** — Now uses `BrandLogo` component in header.

---

## Next Steps / Ideas

- **Phase: XP from real events** — award XP when viewing a match, completing a stat comparison, exploring a team profile.
- **Phase: Node unlocking gates** — require previous node to be level 1 before adjacent node can be upgraded.
- **Phase: Visual map connections** — draw SVG lines between connected nodes on the grid.
- **Phase: Real crest images** — when live proxy is active, TheSportsDB `strBadge` replaces SVG crests.
- **Phase: Mobile Galaxy Map** — optimise the region/node layout for small screens.
- **Phase: Player card rewards** — node completion unlocks special player card view or highlight reel.
