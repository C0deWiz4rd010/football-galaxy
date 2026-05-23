# Football Galaxy - Development Memory

This file tracks implementation steps, decisions, and lessons learned across sessions.

---

## Session: 2026-05-17 - live-proxy-player-data-ui

### Goals
1. Make Live Proxy the primary local/product data path.
2. Keep Local mode as a development-only fallback control.
3. Replace synthetic live player stats with source-backed ESPN roster stats where possible.
4. Compact sidebar, league dashboard, team detail, and player detail UI.
5. Improve the in-app handbook and preserve dashboard structure guidance in project docs.

### Data decisions
- `src/services/config/liveProxy.ts` now uses `http://localhost:8787/api/live` as the development default when no explicit `VITE_LIVE_DATA_PROXY_URL` is set.
- `src/contexts/DataSourceContext.tsx` now defaults to `live` when the proxy is configured by env/default.
- `src/services/theSportsDb.ts` now maps ESPN roster players into app `Player` objects via `mapEspnPlayer`.
- ESPN endpoint paths were corrected: `site.api.espn.com/apis/site/v2` for teams/rosters/scoreboards and `site.web.api.espn.com/apis/v2` for standings.
- `src/services/footballData.ts` now prefers the live ESPN/TheSportsDB service before football-data.org so team IDs stay consistent across list, team, and player pages.
- ESPN roster stats provide appearances, goals, assists, yellow cards, red cards, shots, shots on target, saves, and derived minutes.
- Wikimedia Commons is used as a targeted player-photo fallback through Wikidata for visible top/detail players when ESPN does not expose headshots.
- TheSportsDB mass player-photo lookups were avoided because Cloudflare rate-limited repeated roster enrichment.
- Generated player avatars remain the final fallback because ESPN does not consistently expose official headshots.

### UI decisions
- Sidebar league rows and favorites were reduced so the five leagues fit without desktop nav scrolling.
- League dashboard headline metrics now use colored semantic icons and the spotlight player card includes a player image.
- The standings table now includes a compact legend for abbreviations, Champions League zone, relegation zone, favorites, and form dots.
- Team and player detail hero areas were tightened so identity and key stats are visible sooner.
- Squad tables now surface live stat fields directly: apps, goals, assists, yellow cards, form, and nationality.
- Team detail now fetches standings directly and uses live-first IDs, so table position and team context match the selected ESPN club.

### Documentation
- Added `docs/plans/live-proxy-player-ui-data-quality-plan.md`.
- Added `docs/skills/dashboard-structure-football-galaxy.md`.
- Added `docs/features/live-proxy-player-data-ui-2026-05-17.md`.
- Added `docs/qa/player-stats-live-comparison-2026-05-17.md`.
- Updated README and `.env.example` to explain `npm run dev:all` and the dev proxy default.

### Verification notes
- Lint, tests, and production build passed.
- Production preview was checked: the app renders, the `Lokal` header tab is hidden, and `Live-Proxy` remains visible.
- Vite manual chunks were adjusted so React/ReactDOM stay in the vendor graph and no longer blank the production preview.
- Live proxy health check passed after starting `npm run proxy:dev`.
- ESPN roster comparison covered Liverpool, Bayern Munich, Real Madrid, Internazionale, and Paris Saint-Germain.

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

- **Data Command Center concepts** - Three dashboard concept images were generated and saved in `docs/concepts/` for main league view, team detail, and player detail. The implementation plan lives in `docs/plans/main-dashboard-command-center-implementation-plan.md`.
- **Live fallback honesty** - Live providers now throw on upstream failure so football-data.org or local fallback is chosen deliberately. Rejected live caches are cleared and live labels depend on a live `lastUpdated` summary.
- **Main dashboard table-first follow-up** - The league dashboard now uses a concept-style primary table plus right insights rail. League loading uses a visible table skeleton so top-five league navigation does not appear blank while live data resolves.
- **Phase: XP from real events** — award XP when viewing a match, completing a stat comparison, exploring a team profile.
- **Phase: Node unlocking gates** — require previous node to be level 1 before adjacent node can be upgraded.
- **Phase: Visual map connections** — draw SVG lines between connected nodes on the grid.
- **Phase: Real crest images** — when live proxy is active, TheSportsDB `strBadge` replaces SVG crests.
- **Phase: Mobile Galaxy Map** — optimise the region/node layout for small screens.
- **Phase: Player card rewards** — node completion unlocks special player card view or highlight reel.
