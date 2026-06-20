# Free Sovereign Live Data + Cohesive UI/UX Plan

Status: in progress
Created: 2026-06-20

## Goal

Power the top-5 leagues, player data, and World Cup 2026 from **free, robust**
sources, and unify the UI/UX so live-state, data-source, and refresh behaviour
feel cohesive across the whole app.

## Key research finding (load-bearing)

football-data.org's **free-forever** tier covers **both**:

- Top-5 leagues: `PL`, `PD` (La Liga), `BL1`, `SA`, `FL1` — already used.
- **FIFA World Cup** — competition code `WC`, id `2000` (confirmed on the
  official coverage page).

=> A single free API can power the **whole** app. Rate limit: 10 req/min.

Supporting free sources:

- **TheSportsDB** free key `123` (30 req/min): images, squads, v1 livescores.
- **ESPN** `site.api.espn.com` (no key) + **Wikimedia** (no key): player photos
  and crests.
- **API-Football** is currently mandatory only for the World Cup. It is demoted
  to an **optional** live-minute enhancement, removing the mandatory 2nd key.

## Current architecture (confirmed)

- Cascade: `src/services/footballData.ts` -> `footballDataOrg` -> `theSportsDb`
  -> `openFootball` (historical) -> `mock`.
- Proxy: `proxy/football-data-proxy.mjs` (allowlist + key injection, port 8787).
- Source toggle: `src/contexts/DataSourceContext.tsx` (`live` | `fallback`).
- Leagues hook: `src/hooks/useFootballData.ts` (has `dataCache`).
- World Cup: `src/hooks/useWorldCupData.ts` ->
  `src/services/worldCup/worldCup.ts` -> `apiFootballProvider` **only**.
  Live-only, ignores the toggle, **no fallback snapshot** => biggest gap.
- Snapshots: `standings-snapshot.json`, `squads-snapshot.json`.
- League config: `src/lib/leagues.ts`.

## Phases

### Phase 1 — Data sovereignty: unify on football-data.org free tier

- Add a World Cup provider backed by football-data.org `WC` competition
  (groups/standings, matches, scorers), mirroring `footballDataOrg.ts`.
- Keep API-Football as an **optional** flagged enhancement provider.
- Add WC competition id `2000` to a World Cup config.

### Phase 2 — Robustness ("souverän"): caching + snapshots + rate-limit safety

- World Cup local snapshot (`world-cup-snapshot.json`) + a fallback provider so
  the WC area works offline.
- Convert `useWorldCupData` to a cascade (not live-only).
- Shared persistent client cache (localStorage, TTL, stale-while-revalidate)
  used by both hooks so 10 req/min is never tripped on navigation.
- Proxy: in-memory response cache + 429 backoff; surface
  `X-RequestsAvailable`.

### Phase 3 — Player data quality (free)

- Standardise the photo cascade: football-data persons -> TheSportsDB (123) ->
  ESPN -> Wikimedia -> generic avatar. Cache resolved URLs.

### Phase 4 — UI/UX cohesion

- Shared `<DataState>` (loading skeleton / empty / error / offline) reused by
  leagues **and** World Cup.
- Unified live-status system: LIVE pulse, "updated Xs ago", auto-refresh
  indicator, data-source badge (Live / Snapshot / Offline) — one component used
  everywhere.
- Extend the league accent-colour design system to World Cup.
- Consistent motion + skeleton timing tokens across dashboard, leagues,
  players, World Cup.

### Phase 5 — Verification

- `npm test`, `npm run lint`, `npm run build`.
- Toggle Live/Fallback -> both leagues and WC render (WC no longer blank).
- Disconnect network -> snapshots render with an Offline badge.
- Rapid navigation stays under 10 req/min (cache holds).

## Decisions

- World Cup unified on football-data.org free `WC` competition; API-Football
  demoted to optional.
- Snapshots committed for offline-first (hostable as a static frontend).
- Out of scope: paid tiers, leagues beyond top-5 + WC, backend DB.
