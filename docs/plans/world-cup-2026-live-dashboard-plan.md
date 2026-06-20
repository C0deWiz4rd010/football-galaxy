# World Cup 2026 Live Dashboard Plan

## Summary

World Cup 2026 is a separate Football Galaxy product area. It must not be mixed into the top-five league dashboards. The league area keeps its current routes, data models, and UI focus, while the World Cup area gets its own navigation group, routes, data provider, pages, and fallback states.

The visual source for this feature is `docs/concepts/world-cup-2026-standalone-hub-concept.png`.

## Key Changes

- Add a dedicated sidebar group for `World Cup 2026` with links for overview, matches, groups, bracket, and teams.
- Add standalone routes under `/world-cup-2026`, including match and team detail routes.
- Add a separate `WorldCupProvider` and World Cup data models. Do not add World Cup fields to league summaries.
- Use API-Football through the existing proxy infrastructure. The browser never sees `API_FOOTBALL_KEY`.
- Keep local fallback data visibly marked as fallback/preview data.

## Implementation

- Extend the proxy host allowlist with `v3.football.api-sports.io` and inject `x-apisports-key` only for that host.
- Add World Cup service files under `src/services/worldCup/` for types, mock fallback data, API-Football mapping, and the public provider facade.
- Add `useWorldCupData` so the World Cup UI does not use `useFootballData` or league service methods.
- Add World Cup pages under `src/pages/world-cup/` with loading, empty, error, and partial-data states.
- Update router, sidebar, mobile nav, and command palette with separate World Cup entries.

## UI/UX Polish Pass

- Bring the World Cup hub closer to the standalone concept by adding a stronger tournament hero, route tabs, a primary live/next-match feature card, a compact tournament status rail, and denser mini group tables.
- Improve match discovery with visible active filter chips, clearer result counts, status tabs, and stronger empty states.
- Improve group and bracket readability with qualification legends, compact ranking treatment, and mobile-safe horizontal bracket affordances.
- Keep all improvements inside `src/features/world-cup/` and `src/pages/world-cup/` so league surfaces stay untouched.

## UI/UX Polish Pass 2

- Strengthen detail pages so match detail feels like a match center and team detail feels like a national team profile, not just raw lists.
- Add team search/group filtering for the teams page.
- Improve mobile affordances for the World Cup section tabs and long page titles.
- Add clearer score breakdown, squad grouping, fixture context, and empty/loading copy where data is still pending.

## UI/UX Polish Pass 3

- Replace plain host-city badges with a more visual host-city panel grouped by country.
- Add a group quick-select rail to the teams page so users can jump through Groups A-L without opening a select first.
- Make the bracket board communicate placeholder state, real qualified-team state, and mobile scroll behavior more clearly.

## API-Football Setup

- Set `API_FOOTBALL_KEY` in `.env`; do not use a `VITE_` prefix.
- Run `npm run dev:all` locally so Vite and the proxy run together.
- World Cup 2026 uses API-Football league `1` and season `2026`.
- Required endpoints:
  - `/fixtures?league=1&season=2026`
  - `/fixtures?league=1&season=2026&live=all`
  - `/standings?league=1&season=2026`
  - `/teams?league=1&season=2026`
  - `/players/squads?team=<teamId>`
  - `/fixtures/events?fixture=<fixtureId>`
  - `/fixtures/lineups?fixture=<fixtureId>`
  - `/fixtures/statistics?fixture=<fixtureId>`
- Polling defaults:
  - live fixtures: 15 seconds
  - live group standings during match windows: 60 seconds
  - teams and squads: manual refresh only

## Test Plan

- Mapper tests for API-Football fixture and group standings payloads.
- Provider tests confirming fallback data carries fallback quality metadata.
- UI/router tests confirming World Cup routes and navigation are separate from league routes.
- Verification with `npm run lint`, `npm run build`, and `npm run test`.

## Assumptions

- API-Football is the default live provider for World Cup 2026.
- League and World Cup data may share proxy infrastructure, but never share domain models.
- Placeholder knockout teams are shown as placeholders, not real qualified teams.

## Real-Data Overhaul — football-data.org (current source of truth)

API-Football requires a separate paid-tier `API_FOOTBALL_KEY` that we do not
have, so its provider always fell back to the offline snapshot. Research showed
that the **football-data.org free tier already covers the FIFA World Cup**
(competition code `WC`, id `2000`) end to end, using the same proxy + key that
power the league dashboards. This is now the live World Cup provider.

- Live provider: `src/services/worldCup/footballDataProvider.ts`
  (`footballDataWorldCupProvider`). Cascade in `worldCup.ts`:
  `footballData` (live) -> `snapshot` (offline fallback). API-Football provider
  is retained as an alternative but no longer wired.
- Endpoints (all through the proxy, free tier, ~10 req/min):
  - `/v4/competitions/WC/matches` — 104 fixtures with real dates, stages,
    statuses, scores, `score.halfTime`/`fullTime`/`extraTime`/`penalties`,
    and `referees[]`.
  - `/v4/competitions/WC/standings` — 12 groups (A–L), 4 rows each, with form.
  - `/v4/competitions/WC/teams` — 48 national teams with official crest URLs
    (`https://crests.football-data.org/<id>.png|svg`).
  - `/v4/teams/{id}` — 26-player squad, ages (from `dateOfBirth`), and coach.
  - `/v4/matches/{id}` — single match detail.
- Team/match/standing ids are prefixed `fd-` (e.g. team route
  `/world-cup-2026/team/fd-762` = Argentina). Group letters are derived from
  standings and back-filled onto the teams list.
- Confirmed live (simulated date 2026-06-20, group stage in flight): real group
  tables (e.g. Group A — Mexico 6 pts), finished results with HT/FT breakdown
  (Mexico 2-0 South Africa, ref Wilton Sampaio), Argentina squad under coach
  Lionel Scaloni, and a knockout bracket that fills in as groups complete.

### Free-tier gaps (UI degrades gracefully)

The free tier does NOT expose in-match event timelines, lineups/formations,
possession-style statistics, player photos, or venues. The provider returns
empty arrays / `undefined` for these, and the pages show explicit empty-state
copy ("No live event timeline…", "Lineups appear close to kickoff…", "Venue
pending"). No data is invented.

### Verification

`npm run lint`, `npm test` (15 tests), and `npm run build` all pass. Validated
in-browser across overview, matches, groups, bracket, teams, team detail, and
match detail with the proxy running (`npm run proxy:dev`).
