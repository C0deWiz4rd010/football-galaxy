# Hybrid Statistics Dashboard Plan

## Summary

Build Football Galaxy into a premium, static-hostable football statistics dashboard for the top five European leagues. The app will support two interchangeable data modes:

- Live mode via `football-data.org` when `VITE_API_KEY` is configured.
- Historical mode via local JSON files that mimic `openfootball/football.json`.

The first implementation will prioritize a complete navigable UI, strong data contracts, robust loading/error/empty states, and realistic mock data so the app runs immediately without external credentials.

## Requirements

- Vite + React + TypeScript frontend with React Router routes for league, team, player, and comparison pages.
- Tailwind-based dark visual system with league accent colors and shadcn-style primitives.
- Data source context containing `dataSource` and `selectedSeason`.
- Services with matching function signatures:
  - `getLeagueTable`
  - `getTopScorers`
  - `getTopAssists`
  - `getTeamSquad`
  - `getPlayerStats`
  - `getMatches`
  - `searchEntities`
- A `useFootballData` hook that routes component calls to the correct service.
- Mock current-season data for all five leagues.
- Historical JSON for at least three seasons, including Premier League and Bundesliga examples.
- Loading skeletons, retryable errors, and empty states through a reusable `DataLoader`.

## Architecture

### App shell

- `src/app/router.tsx` defines lazy-loaded routes with a page skeleton fallback.
- `src/app/app-shell.tsx` owns desktop sidebar, mobile bottom navigation, header, search palette, data-source controls, and info banner.
- `src/app/providers.tsx` wraps Query, theme, and data-source providers.

### Data layer

- `src/types/football.ts` defines UI-facing domain types.
- `src/config/leagues.ts` centralizes league ids, display names, accents, and provider codes.
- `src/services/footballDataOrg.ts` handles live API requests and falls back to mock data when the API key is missing.
- `src/services/openfootball.ts` imports local historical JSON and maps it into the same domain contract.
- `src/hooks/useFootballData.ts` exposes query helpers that choose the service from context.

### UI primitives

- `src/components/ui/*` contains small shadcn-style primitives such as buttons, cards, dialogs, selects, tabs, skeletons, inputs, and badges.
- `src/components/shared/*` contains product-specific components such as `DataLoader`, `DataTable`, `ChartContainer`, `SearchPalette`, and `DataInfoBanner`.

## Build Order

1. Align package dependencies and Vite config with React, SWC, router, charts, motion, table, icons, and Tailwind.
2. Add Tailwind/PostCSS config and global design tokens.
3. Add data contracts, league config, mock data, and historical data.
4. Implement provider contexts, service modules, query hook, and routing.
5. Build shell/navigation/header/search/data-source controls.
6. Build league dashboard cards, sortable table, charts, scorers, matchday card, and empty states.
7. Build team detail, player detail, and comparison pages.
8. Update README and run verification.

## Risks

- `football-data.org` does not expose every requested statistic on the free tier. The live service will map available API fields and use local mock enrichments for missing demo-only details when needed.
- `VITE_API_KEY` is browser-visible in a static frontend. This is acceptable for local/demo usage only; production should add a proxy if key protection becomes important.
- The requested `shadcn-ui` CLI may not run in restricted or non-interactive environments. If unavailable, the implementation will include shadcn-style local primitives with the same composition approach.

## Success Criteria

- `npm run build` succeeds.
- The app renders all required routes without an API key.
- Switching between Live and Historical changes the data source seamlessly.
- Historical mode shows a season selector.
- All data-driven sections expose loading, empty, and error UI.
- Desktop and mobile layouts provide distinct navigation patterns.
