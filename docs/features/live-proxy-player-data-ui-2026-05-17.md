# Live Proxy, Player Data, And Compact UI

Date: 2026-05-17

## What Changed

- Live Proxy is now the preferred local data path. Development builds default to `http://localhost:8787/api/live` when no proxy URL is set.
- The Local mode tab remains available only in development as an offline/QA tool.
- Player live stats now come from ESPN roster statistics when available. The ESPN route split is:
  - teams, rosters, and scoreboards: `site.api.espn.com/apis/site/v2/...`
  - standings: `site.web.api.espn.com/apis/v2/...`
- Live data is preferred before football-data.org so team IDs stay consistent across league, team, and player views.
- Wikimedia Commons is now used as a targeted player-photo fallback through Wikidata when ESPN roster payloads do not expose a headshot.
- TheSportsDB remains in the live path for league/team enrichment, but player-photo mass lookups are avoided to reduce rate-limit risk.
- Sidebar density was reduced so the top-five leagues remain visible without a desktop inner scroll.
- League dashboards now have a compact headline stat strip, colored semantic icons, a player image in the spotlight card, and a table legend.
- Team and player detail pages were tightened so the key facts appear sooner.
- Production manual chunking was fixed so preview builds render correctly instead of splitting React/ReactDOM into an unsafe cycle.
- The handbook was rewritten in clearer German/English copy and now explains the live proxy expectation.
- Data fallback honesty was tightened: live adapters now throw on upstream failure, rejected live caches are cleared, ESPN leaderboards no longer mix generated squad fallbacks into live rankings, and the league badge only shows Live Proxy for live-updated summaries.
- Three Data Command Center dashboard concepts were generated and saved under `docs/concepts/` as the visual direction for the next main/team/player dashboard pass.

## Data Verification

The live player-stat comparison artifact is:

- `docs/qa/player-stats-live-comparison-2026-05-17.md`

It compares all ESPN roster players for:

- Liverpool
- Bayern Munich
- Real Madrid
- Internazionale
- Paris Saint-Germain

The app maps the same source stat names in `src/services/theSportsDb.ts` via `mapEspnPlayer`.

## Concept Artifacts

- `docs/concepts/main-dashboard-command-center-2026-05-17.png`
- `docs/concepts/team-detail-command-center-2026-05-17.png`
- `docs/concepts/player-detail-command-center-2026-05-17.png`
- `docs/concepts/dashboard-command-center-prompts-2026-05-17.md`
- `docs/plans/main-dashboard-command-center-implementation-plan.md`

## Important Runtime Note

If the user opens only `http://localhost:5173/` with `npm run dev`, the frontend may render but true live data will not load unless the proxy is also running.

Use:

```bash
npm run dev:all
```

or start the proxy separately:

```bash
npm run proxy:dev
```

## Remaining Data Limitation

ESPN roster payloads do not consistently expose official player headshots. Football Galaxy now tries:

1. ESPN headshot field, when present
2. Wikimedia Commons image resolved through Wikidata, for visible top/detail players
3. TheSportsDB cutout/thumb/render images where a direct team/player lookup is already available
4. generated player avatar as an honest fallback

That means some lower-visibility player rows can still show generated fallback imagery until a verified licensed photo source is available.
