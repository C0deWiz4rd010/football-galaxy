# Football Galaxy

Football Galaxy is a polished football statistics dashboard for the top five European leagues, featuring a progressive Galaxy Map exploration mode.

## Prerequisites

- Node 20+
- npm 10+

## Install & Run

```bash
npm install
npm run dev
```

If npm reports peer dependency conflicts while moving between React versions, run:

```bash
npm install --legacy-peer-deps --no-audit --no-fund
```

## Live API

Football Galaxy uses TheSportsDB v1 in live mode. It does not require signup for the default setup; the public free key is `123`.

Official docs: https://www.thesportsdb.com/documentation

The app works immediately without `.env`. In the browser, the app defaults to local fallback data because public live endpoints such as ESPN standings and scoreboards are not reliably browser-accessible due to CORS.

To enable real live mode in the browser, run the local proxy and set `VITE_LIVE_DATA_PROXY_URL`:

```bash
npm run proxy:dev
```

```env
VITE_LIVE_DATA_PROXY_URL=http://localhost:8787/api/live
```

The live service layer remains in the codebase and now routes requests through that proxy when it is configured.

## Live vs Historical

- Live service: fetches teams, badges, players, player images, and season events from TheSportsDB plus ESPN-derived standings data when a proxy or server-side access path is available.
- Local fallback: loads curated mock and historical data from `src/data/mock/` and `src/data/historical/`.
- Current default: browser-safe local fallback for stable rendering and predictable development.
- Important: the fallback leagues contain partially fictionalized club identities. Each team is assigned a distinct primary color inspired by its real-world counterpart, giving visually unique crests even in fallback mode.

## Galaxy Map

The Galaxy Map (`/galaxy`) is a node-level progression system layered over the five league regions.

- Each **region** maps to a league and contains 5 nodes.
- Each **node** has up to 3 levels. Upgrading a node costs XP and unlocks rewards (more XP, lore entries, badges).
- **Region milestones** trigger when enough nodes reach a minimum level, granting passive bonuses and lore.
- **Lore texts** appear when entering a region and upon completion.
- Progress is stored in `localStorage` under `football-galaxy-map-progress`.

XP is earned through demo buttons (for now) and will tie into real match events in a later phase.

## League IDs

- `premier-league`
- `bundesliga`
- `la-liga`
- `serie-a`
- `ligue-1`

## Project Structure

```text
src/
  assets/
  components/
    layout/
    league/
    player/
    shared/
    team/
    ui/
  contexts/
  data/
    historical/
    mock/
  features/
    galaxy-map/       ← region/node progression system
  hooks/
  lib/
  pages/
  services/
```

## Add a League

1. Add the league config in `src/lib/leagues.ts`.
2. Add a mock data file in `src/data/mock/` with `teamColors` array.
3. Register it in `src/data/mock/index.ts`.
4. Add historical JSON files if historical mode should support it.
5. Add a region entry in `src/features/galaxy-map/data.ts`.
6. Confirm routes, command search, sidebar, and mobile tab bar render the new league.


## Prerequisites

- Node 20+
- npm 10+

## Install & Run

```bash
npm install
npm run dev
```

If npm reports peer dependency conflicts while moving between React versions, run:

```bash
npm install --legacy-peer-deps --no-audit --no-fund
```

## Live API

Football Galaxy uses TheSportsDB v1 in live mode. It does not require signup for the default setup; the public free key is `123`.

Official docs: https://www.thesportsdb.com/documentation

The app works immediately without `.env`. In the browser, the app defaults to local fallback data because public live endpoints such as ESPN standings and scoreboards are not reliably browser-accessible due to CORS.

To enable real live mode in the browser, run the local proxy and set `VITE_LIVE_DATA_PROXY_URL`:

```bash
npm run proxy:dev
```

```env
VITE_LIVE_DATA_PROXY_URL=http://localhost:8787/api/live
```

The live service layer remains in the codebase and now routes requests through that proxy when it is configured.

## Live vs Historical

- Live service: fetches teams, badges, players, player images, and season events from TheSportsDB plus ESPN-derived standings data when a proxy or server-side access path is available.
- Local fallback: loads curated mock and historical data from `src/data/mock/` and `src/data/historical/`.
- Current default: browser-safe local fallback for stable rendering and predictable development.
- Important: the fallback leagues contain partially fictionalized club identities, so generated crests remain correct there until real club datasets replace them.

## League IDs

- `premier-league`
- `bundesliga`
- `la-liga`
- `serie-a`
- `ligue-1`

## Project Structure

```text
src/
  assets/
  components/
    layout/
    league/
    player/
    shared/
    team/
    ui/
  contexts/
  data/
    historical/
    mock/
  hooks/
  lib/
  pages/
  services/
```

## Add a League

1. Add the league config in `src/lib/leagues.ts`.
2. Add a mock data file in `src/data/mock/`.
3. Register it in `src/data/mock/index.ts`.
4. Add historical JSON files if historical mode should support it.
5. Confirm routes, command search, sidebar, and mobile tab bar render the new league.
