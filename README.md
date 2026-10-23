# Football Galaxy

Football Galaxy is a polished football statistics dashboard for the top five European leagues
(Premier League, La Liga, Bundesliga, Serie A, Ligue 1), with standings, team and player pages,
live scores, comparison tools, a World Cup 2026 archive and a progressive Galaxy Map mode.

The app is **live-only**: every number comes from a real data source. There is no mock or
fallback data in the UI — when all sources fail, the page shows an honest error state with a
retry action.

## Features

- League dashboards with standings, per-league table zones (CL/EL/ECL, relegation play-off,
  relegation), form, top scorers/assists and matchweek results
- Team pages (squad, results, charts, stadium/coach metadata) and coach pages
- Player pages (stats per appearance, percentiles, form score, portraits)
- Players and teams explorer, command-palette search, player comparison
- Live scores across all five leagues with a freshness badge ("Aktuell" / "Stand hh:mm" /
  stored copy when the provider is unreachable)
- World Cup 2026 archive: overview, matches, groups, bracket (incl. extra time / penalties),
  teams and match details
- Galaxy Map (`/galaxy`): progression mode over the five league regions; progress is stored in
  `localStorage` under `football-galaxy-map-progress`
- German and English UI, light/dark themes and colour palettes, installable (web manifest)

## Data sources

| Source | Key | Used for |
|---|---|---|
| ESPN (keyless) | — | **Primary:** tables, matches, leaders, rosters, players, live scores, search |
| football-data.org | free tier, proxy-only `FOOTBALL_DATA_API_KEY` | World Cup 2026 archive, stadium/coach metadata on team pages, fallback league source |
| OpenLigaDB (keyless) | — | Bundesliga table fallback |
| TheSportsDB | public key `123` | Crests and club metadata only |
| Wikidata | — | Player portraits (only matches described as footballers) |

League cascade ([`src/services/footballData.ts`](src/services/footballData.ts)):
**ESPN → football-data.org → OpenLigaDB** (Bundesliga table only). Team, squad and player pages
are keyed by ESPN ids and therefore use ESPN only.

The **World Cup 2026** ended on 2026-07-19 and runs in archive mode: the data is loaded once from
football-data.org, stays fresh for 24 h and is not polled.

Data fetching uses TanStack Query with a persisted cache (busted by the app version); external
responses are validated with Zod.

## Getting started

Requirements: **Node 22+** (used in CI) and npm.

```bash
npm ci
cp .env.example .env      # add FOOTBALL_DATA_API_KEY for the World Cup archive and fallbacks
npm run dev:all
```

`npm run dev:all` starts:

- Vite on `http://localhost:5173/`
- the dev proxy on `http://localhost:8787/api/live`

`npm run dev` alone starts the frontend without the proxy, so no data arrives; a dev-only banner
then reminds you to use `npm run dev:all`. All environment variables are documented in
[`.env.example`](.env.example). Only `VITE_`-prefixed variables reach the browser; the API key
stays on the proxy.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev:all` | Vite + dev proxy together (recommended) |
| `npm run dev` | Vite only |
| `npm run proxy:dev` | Node dev proxy only (reads `.env`) |
| `npm run build` | Type check + production build to `dist/` |
| `npm run build:hostinger` | Hostinger package to `dist-hostinger/` (app + PHP proxy + `.htaccess`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc -b` |
| `npm test` / `npm run test:watch` | Vitest |
| `npm run test:coverage` | Vitest with coverage |
| `npm run test:proxy` | Proxy contract tests against the Node proxy |
| `npm run test:proxy:php` | Same contract tests against the PHP proxy (needs PHP) |
| `npm run verify:data` | Cross-checks ESPN vs football-data.org tables for all five leagues |

## Proxy

The browser never receives provider secrets, and ESPN does not allow direct browser calls (CORS).
All live requests therefore go through a proxy. There are two implementations of one
specification ([`proxy/SPEC.md`](proxy/SPEC.md)) with shared rules
([`proxy/rules.json`](proxy/rules.json): host allowlist, TTL per route, limits):

- **Node dev proxy** — [`proxy/football-data-proxy.mjs`](proxy/football-data-proxy.mjs)
  (in-memory cache, `npm run proxy:dev`)
- **PHP production proxy** — [`deploy/hostinger/api/live.php`](deploy/hostinger/api/live.php)
  (file cache, stale-on-error, shared football-data.org budget of 10 requests/minute)

Both are covered by the contract tests in [`proxy/tests/`](proxy/tests/).

## Deployment

**Hostinger (primary).** `npm run build:hostinger` produces `dist-hostinger/` (static app,
`api/live.php`, `.htaccess` with SPA fallback, caching and security headers). Every release on
`develop` also attaches `football-galaxy-hostinger-vX.Y.Z.zip` to the GitHub release. Step-by-step
guide: [`docs/deploy-hostinger.md`](docs/deploy-hostinger.md).

**GitHub Pages.** The release workflow ([`.github/workflows/release.yml`](.github/workflows/release.yml))
also deploys to Pages. Pages has no proxy, so the site shows a "Keine Datenquelle verbunden" banner
and no data — unless the repository variable `VITE_LIVE_DATA_PROXY_URL` points at a deployed proxy
(e.g. the Hostinger `live.php`) whose `ALLOWED_ORIGINS` includes the Pages origin.

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs lint, type check, tests, build and
the Node + PHP proxy contract tests.

## League IDs

`premier-league`, `la-liga`, `bundesliga`, `serie-a`, `ligue-1`

## Project structure

```text
src/
  app/          router, route meta table, providers, query client
  assets/       flags, league logos
  components/   layout, league, team, player, charts, settings, shared, ui
  contexts/     data source, favourites, locale, palette
  features/     galaxy-map, live, world-cup
  hooks/        hooks incl. queries/ (TanStack Query hooks)
  i18n/         de.ts (source of truth), en.ts, catalog test
  lib/          leagues, season, table zones, percentiles, ratings, data invariants, …
  pages/        page components incl. world-cup/
  services/     footballData.ts (cascade), espn/, footballDataOrg.ts, openLigaDb/,
                thesportsdb/, wikidata.ts, worldCup/, net/ (fetch client), config/ (proxy URL)
  shared/       design tokens, fonts, shared UI
  test/         test setup, fixtures, real payloads
proxy/          Node dev proxy, SPEC.md, rules.json, contract tests
deploy/         Hostinger PHP proxy and config sample
scripts/        build-hostinger, test-proxy, verify-live-data
public/         icons, manifest, Open Graph image
docs/           plans/, design-system.md, deploy-hostinger.md, memory.md, qa/, …
```

## Documentation

- Plans: [`docs/plans/README.md`](docs/plans/README.md) — active plan:
  [`20-data-correctness-and-release.md`](docs/plans/20-data-correctness-and-release.md)
- Design system: [`docs/design-system.md`](docs/design-system.md)
- Agent instructions: [`AGENTS.md`](AGENTS.md)
