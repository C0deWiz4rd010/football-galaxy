# Football Galaxy Stabilization Refactor Plan

## Goal

Bring the app back to a reliable, debuggable baseline after the recent UI expansion introduced runtime fragility.

This refactor is not a cosmetic pass. It focuses on:

- restoring the main views so they render reliably
- simplifying the shell and data flow
- removing brittle view assumptions
- making each major page tolerant to partial or missing data

## Main Problems To Address

- dashboard rendering depends on optimistic assumptions about secondary data
- the league table implementation is too complex for a primary surface
- shell components perform extra work that is not necessary for first paint
- several views mix product logic, data fallback assumptions, and UI concerns in one file
- current architecture is too easy to break without lint/build catching it

## Refactor Scope

### 1. App Shell Stabilization

- simplify route title logic
- reduce unnecessary shell-side async work
- ensure navigation renders even when page data is incomplete

### 2. Data Access Hardening

- keep fallback-safe access for all main entities
- reduce unsafe assumptions in dashboard, team, and player pages
- create reusable catalog helpers for explorers and navigation

### 3. Dashboard Rebuild For Stability

- keep the league dashboard table-first
- make every secondary panel optional and safe
- ensure the dashboard still renders when matches or leaders are missing

### 4. Table Refactor

- remove brittle table row composition
- keep rows semantic, keyboard-accessible, and clickable
- avoid menu wrappers that can break table rendering

### 5. Explorer And Search Cleanup

- keep explorers driven by stable local catalog data
- add empty states and predictable sorting
- ensure command palette navigation does not depend on fragile live lookups

### 6. Verification

- add a runtime-oriented render test for the app shell or dashboard
- run lint, build, and tests after the refactor

## Files In Scope

- `src/app/router.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/MobileTabBar.tsx`
- `src/components/league/LeagueTable.tsx`
- `src/components/league/MatchOfTheDay.tsx`
- `src/components/league/TopScorersCard.tsx`
- `src/components/shared/CommandPalette.tsx`
- `src/hooks/useLeagueLogos.ts`
- `src/hooks/useFootballData.ts`
- `src/lib/explorer-data.ts`
- `src/pages/LeagueDashboard.tsx`
- `src/pages/PlayersExplorer.tsx`
- `src/pages/TeamsExplorer.tsx`

## Success Criteria

- the main league dashboard renders reliably again
- the standings table is visible and interactive
- sidebar, mobile nav, and search remain usable even if live fetches fail
- explorer pages render predictable content
- app shell and dashboard are covered by at least one higher-level render check
