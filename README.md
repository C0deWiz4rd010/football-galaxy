# Football Galaxy

Football Galaxy is a polished football statistics dashboard for the top five European leagues, with compact standings, team detail pages, player profiles, comparison tools, and a progressive Galaxy Map mode.

## Prerequisites

- Node 20+
- npm 10+

## Install

```bash
npm install
```

## Run Locally

Use the combined dev command when you want live data:

```bash
npm run dev:all
```

This starts:

- Vite on `http://localhost:5173/`
- the local live proxy on `http://localhost:8787/api/live`

You can still run only the frontend with `npm run dev`, but live provider calls will fall back if the proxy is not running.

## Live Proxy

The browser should not receive provider secrets. Football Galaxy therefore routes live requests through `proxy/football-data-proxy.mjs`.

Local development defaults to:

```env
VITE_LIVE_DATA_PROXY_URL=http://localhost:8787/api/live
```

You can leave `VITE_LIVE_DATA_PROXY_URL` empty in development because the app now uses the local proxy default. Production builds should set the deployed proxy URL explicitly.

Proxy-only secrets stay without the `VITE_` prefix:

```env
FOOTBALL_DATA_API_KEY=your_server_only_key
```

## Data Sources

- `football-data.org`: standings, official crests, fixtures, scorers where available.
- ESPN: league standings, teams, scoreboards, and live roster player stats.
- TheSportsDB: team art and player-photo fallback candidates.
- Local mock data: final development/offline fallback so the app always renders.

The local fallback tab is intended for development and offline QA. Product focus is the Live Proxy path.

## League IDs

- `premier-league`
- `bundesliga`
- `la-liga`
- `serie-a`
- `ligue-1`

## Project Structure

```text
src/
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
    galaxy-map/
  hooks/
  lib/
  pages/
  services/
proxy/
scripts/
docs/
```

## Useful Commands

```bash
npm run dev:all
npm run build
npm run test
npm run lint
node scripts/compare-live-player-stats.mjs
```

## Galaxy Map

The Galaxy Map (`/galaxy`) is a node-level progression mode layered over the five league regions. Progress is stored in `localStorage` under `football-galaxy-map-progress`.
