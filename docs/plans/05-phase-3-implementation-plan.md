# Football Galaxy Phase 3 Implementation Plan

## Purpose

This plan turns the product blueprint from `phase-2-product-information-plan.md` into concrete implementation tracks, files, and success criteria.

Phase 3 should not be treated as a single giant redesign. It should be executed in small, reviewable slices.

## Phase 3 Goals

- unify the visual system across the current app
- rebuild the league dashboard as the flagship experience
- establish shared `Galaxy Live` and `EA FC Mode` infrastructure
- improve team and player information architecture
- introduce a reusable derived player attribute model
- redesign compare around stronger visual storytelling

## Scope Lock For This Cycle

This cycle should cover:

- app-wide design tokens and motion tokens
- one global display mode switch
- dashboard shell rebuild
- player profile upgrades
- early EA FC card presentation
- compare improvements for players

This cycle should not yet cover:

- deep fixture center
- auth
- backend
- unofficial Transfermarkt integration
- advanced squad builder mechanics

## Canonical Route Map

Recommended v1 route map:

- `/` -> redirect to `/premier-league`
- `/:leagueId`
- `/:leagueId/team/:teamId`
- `/:leagueId/player/:playerId`
- `/players`
- `/teams`
- `/compare`

Optional later:

- `/ea-fc`

Recommendation:

- keep `EA FC Mode` initially as a global presentation mode, not a separate route-only product

## Core Implementation Tracks

## Track 1: Design System Unification

### Goal

Establish one source of truth for tokens, surfaces, typography, and motion.

### Deliverables

- single global token system in `src/index.css`
- reusable surface classes
- reusable section spacing rules
- shared motion tokens in `src/shared/motion/`

### Files

- `src/index.css`
- `src/shared/styles/globals.css`
- `src/shared/motion/*`
- `tailwind.config.ts`

### Success criteria

- one coherent visual language
- no competing token sets
- common motion timings used in wrappers, overlays, and route transitions

## Track 2: App Mode Foundation

### Goal

Create the shared presentation switch between `Galaxy Live` and `EA FC Mode`.

### Deliverables

- app mode context
- persisted mode selection
- header switch control
- mode-aware helpers for future styling

### Files

- `src/contexts/AppModeContext.tsx`
- `src/hooks/useAppMode.ts`
- `src/app/providers.tsx`
- `src/components/layout/Header.tsx`

### Success criteria

- user can switch modes globally
- mode is available to pages and components
- no duplicate data model required

## Track 3: Dashboard Rebuild

### Goal

Turn the league dashboard into the strongest page in the product.

### Deliverables

- redesigned hero
- clearer summary strip
- improved table shell
- insight rail for scorers, assists, and featured match
- more intentional responsive layout

### Files

- `src/pages/LeagueDashboard.tsx`
- `src/components/league/LeagueTable.tsx`
- `src/components/league/TopScorersCard.tsx`
- `src/components/league/TopAssistsCard.tsx`
- `src/components/league/MatchOfTheDay.tsx`
- `src/components/league/TeamStatsCard.tsx`
- `src/components/layout/PageWrapper.tsx`

### Success criteria

- users can scan league state in seconds
- page feels premium on desktop and mobile
- loading and error states match the design system

## Track 4: Player Profile Upgrade

### Goal

Make player pages feel intentional and data-rich.

### Deliverables

- stronger player hero
- headline stat blocks
- radar chart section
- trend and contribution sections
- mode-aware EA FC card preview

### Files

- `src/pages/PlayerDetail.tsx`
- `src/components/player/PlayerHeader.tsx`
- `src/components/player/RadarChart.tsx`
- `src/components/player/PerformanceChart.tsx`
- `src/components/player/StatBar.tsx`
- `src/components/shared/FavoriteButton.tsx`

### Success criteria

- player pages feel like a destination, not just a detail screen
- radar chart is understandable and visually compelling
- derived attributes are clearly labeled where needed

## Track 5: Derived Attribute Engine

### Goal

Power EA FC-inspired visuals with a documented internal model.

### Deliverables

- attribute derivation utilities
- overall rating derivation
- archetype tagging
- mode-aware card data mapper

### Files

- `src/lib/player-ratings.ts`
- `src/lib/player-archetypes.ts`
- `src/services/mappers/*` as needed
- `src/services/types.ts`

### Success criteria

- six headline attributes available for supported players
- overall rating can be computed consistently
- formulas are understandable and testable

## Track 6: Compare Redesign

### Goal

Make compare one of the most impressive surfaces in the app.

### Deliverables

- stronger selection flow
- side-by-side summary cards
- radar chart diff
- live mode vs EA FC mode visual toggle
- clearer strengths / weaknesses framing

### Files

- `src/pages/Compare.tsx`
- new compare helper components if needed under `src/components/player/` or `src/components/shared/`

### Success criteria

- compare feels deliberate and polished
- both modes are understandable
- users can quickly see who differs where

## Data Model Work

Before feature implementation expands, align types for:

- `League`
- `Team`
- `Player`
- `Match`
- `DerivedPlayerAttributes`
- `PlayerCardProfile`

Recommended new type additions:

- `AppMode = 'live' | 'ea-fc'`
- `PlayerAttributeSet`
- `PlayerCardTier`
- `PlayerArchetype`

## Suggested Build Order

1. design tokens + motion tokens
2. app mode context + header switch
3. dashboard shell rebuild
4. player attribute engine
5. player page upgrade
6. compare redesign

## Testing Plan

Add or update tests for:

- app mode persistence
- derived rating logic
- dashboard rendering with key states
- player page derived attribute rendering
- compare mode switching

Likely files:

- `src/app/app.test.tsx`
- new tests under `src/lib/`
- page-level tests where practical

## Risks

- trying to fully redesign every page at once
- mixing real and derived data without labeling it
- overbuilding EA FC mode before the live product is strong
- adding too many one-off card styles

## Definition Of Done

Phase 3 is successful when:

- the app has one unified visual system
- the dashboard feels flagship-quality
- the player page and compare page feel premium
- a global `Galaxy Live` / `EA FC Mode` switch exists
- derived player attributes are consistent and testable
- the implementation remains incremental and maintainable
