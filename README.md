# Football Galaxy

Football Galaxy is a polished football statistics dashboard for the top five European leagues.

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

The app works immediately without `.env`. If TheSportsDB is unavailable or rate limited, the app falls back to local mock data.

## Live vs Historical

- Live: fetches teams, badges, players, player images, and season events from TheSportsDB.
- Historical: loads local openfootball-style JSON files from `src/data/historical/`.
- Switching modes is instant and does not reload the page.

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
