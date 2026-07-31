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

Always use the combined dev command — the app is live-only and needs the proxy:

```bash
npm run dev:all
```

This starts:

- Vite on `http://localhost:5173/`
- the local live proxy on `http://localhost:8787/api/live`

Running only `npm run dev` starts the frontend without the proxy, so no live data
arrives and requests fail after a few seconds of retries. In that case a dev-only
banner tells you to start `npm run dev:all`.

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

The app is live-only. League data cascades across free sources so the table always
has a source to fall back to:

- `TheSportsDB` (free key `123`): primary standings, scorers, team art, player photos.
- ESPN (keyless): standings safety net covering all top-5 leagues, plus live scoreboards.
- `football-data.org` (free tier, server-only key): standings, official crests, fixtures, scorers.
- OpenLigaDB (keyless): extra Bundesliga table safety net.

When every live source fails, the UI shows an honest error state with a retry action
rather than stale or fabricated data.

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
