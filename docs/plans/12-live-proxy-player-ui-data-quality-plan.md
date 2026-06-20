# Live Proxy, Player Data, And Compact Dashboard Plan

Date: 2026-05-17

## Goal

Make the active Football Galaxy app feel like a compact live-data product:

- prioritize Live Proxy over local fallback
- keep the local data tab visible only during development
- fix live player statistics by using ESPN roster statistics where available
- improve player photo fallback order without pretending synthetic images are official photos
- reduce sidebar and detail-page bulk
- add a compact standings legend
- make the handbook clearer and multilingual

## Phase 1 - Data Source And Proxy Behavior

Files:

- `src/contexts/DataSourceContext.tsx`
- `src/components/shared/DataSourceToggle.tsx`
- `src/services/theSportsDb.ts`
- `proxy/football-data-proxy.mjs`

Changes:

- default to `live` when `VITE_LIVE_DATA_PROXY_URL` is configured
- expose local fallback controls only in development
- keep live cascade resilient so failed upstream requests still fall back safely
- map ESPN roster statistics for squads: appearances, goals, assists, cards, shots, saves, and derived minutes
- merge TheSportsDB photo candidates into ESPN roster players by normalized player name

Risks:

- proxy must be running locally (`npm run dev:all` or `npm run proxy:dev` plus Vite)
- upstream ESPN/TheSportsDB shapes may change
- football-data.org remains rate-limited

## Phase 2 - Compact UI

Files:

- `src/components/layout/Sidebar.tsx`
- `src/pages/LeagueDashboard.tsx`
- `src/components/league/LeagueTable.tsx`
- `src/components/league/TopScorersCard.tsx`
- `src/components/league/TopAssistsCard.tsx`
- `src/pages/TeamDetail.tsx`
- `src/pages/PlayerDetail.tsx`
- `src/components/player/PlayerHeader.tsx`
- `src/components/team/SquadTable.tsx`

Changes:

- make all top-five league links visible in the desktop sidebar without inner scrolling
- compress favorites to a smaller pinned strip
- make league header cards more compact and table-first
- give summary icons themed colors
- add player image to the spotlight card
- add an explanatory table legend below the standings table
- tighten team and player detail hero cards so key facts fit above the fold

## Phase 3 - Handbook And Project Memory

Files:

- `src/components/shared/HandbookDialog.tsx`
- `src/contexts/LocaleContext.tsx`
- `docs/skills/dashboard-structure-football-galaxy.md`
- `docs/features/live-proxy-player-data-ui-2026-05-17.md`
- `docs/memory.md`

Changes:

- rewrite handbook copy in clearer German/English
- add a language note so the handbook reads as multilingual guidance
- save the dashboard structure principles used this session
- document what shipped and what data limitations remain

## Phase 4 - Verification

Checks:

- compare one team per top-five league against live ESPN roster stats:
  - Liverpool
  - Bayern Munich
  - Real Madrid
  - Internazionale
  - Paris Saint-Germain
- verify app-mapped stats match upstream roster values for all players returned by those teams
- run targeted tests and build
- inspect localhost UI with browser automation at desktop and mobile sizes

Success criteria:

- Live Proxy is the primary visible path.
- Local fallback is development-only in the header.
- Team/player detail pages show compact first-screen information.
- Standings table has a clear legend.
- Player leaderboards and profiles use live ESPN roster stats when available.
- Documentation and memory are updated before final handoff.
