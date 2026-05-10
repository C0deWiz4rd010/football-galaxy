# Football Galaxy Phase 3 Dashboard And Explorer Refresh

## Purpose

This plan sharpens the next Phase 3 slice around the issues found in the current product pass:

- theming feels inconsistent
- the main league page prioritizes the wrong content
- table interactions and hover feedback are too weak
- league navigation lacks trustworthy branding
- global search is too shallow
- there are no true player or team explorer views yet

## Product Direction

The league dashboard should behave like a premium football control room:

- the full standings table is the primary object
- league context, live stories, and spotlight content support the table instead of competing with it
- every important entity can be selected and opened into a richer subview
- mode switching between `Galaxy Live` and `EA FC Mode` changes presentation without breaking navigation or readability

## Scope For This Slice

### 1. Theming Stabilization

- make dark/light theme switching more predictable
- remove styling behaviors that feel jumpy or visually inconsistent
- align background, elevation, and hover rules around one token system

### 2. League Dashboard Recomposition

- reduce the size of the hero area
- make the standings table full-width and clearly primary
- keep all league positions visible
- improve row hover, focus, and click affordances
- move storylines and supporting cards into denser secondary regions

### 3. Interactive League Navigation

- use more trustworthy league branding in sidebar and mobile navigation
- ensure users can jump from table rows to team pages
- add clear UI feedback for cards, rows, and primary actions

### 4. Explorer Surfaces

- add `/players` explorer
- add `/teams` explorer
- provide useful filters and compact list cards
- keep these pages reliable by using the current app data model and fallback-safe catalog data

### 5. Search Palette Upgrade

- surface leagues, teams, and players in grouped results
- add richer labels and context inside hits
- make the palette feel like a real navigation layer rather than a demo search

### 6. Storyline Components

- add compact modules such as `Rising Team`, `Form Monster`, and `Playmaker Of The Week`
- treat these as reusable headline surfaces for the dashboard and future league pages

## Files In Scope

- `src/index.css`
- `src/app/providers.tsx`
- `src/app/router.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/MobileTabBar.tsx`
- `src/components/shared/CommandPalette.tsx`
- `src/components/league/LeagueTable.tsx`
- `src/pages/LeagueDashboard.tsx`
- `src/pages/PlayersExplorer.tsx`
- `src/pages/TeamsExplorer.tsx`
- `src/lib/explorer-data.ts`
- `docs/skills/ui-ux-frontend-session-skill.md`

## Success Criteria

- theme switching feels stable and readable
- the first impression of each league page is the full standings table
- hover and selection states feel intentional across core interactive surfaces
- users can open team and player detail views from multiple entry points
- search returns meaningful grouped hits
- dashboard storylines make the page feel alive without overpowering the standings
