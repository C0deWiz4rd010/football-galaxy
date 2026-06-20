# Milestone 1 Plan: Standings Dashboard Foundation

## Summary

Build the first version of Football Galaxy as a polished, static-first frontend focused on the top 5 European leagues: Premier League, La Liga, Bundesliga, Serie A, and Ligue 1. Milestone 1 should deliver a responsive standings dashboard with a league switcher, a strong visual identity, league summary cards, recent-form indicators, and top-scorer panels.

The repository currently has no frontend scaffold yet, only planning/docs files and `.codex` agent setup. The implementation should therefore start by creating the app foundation and then layering data, UI system, and milestone features in small phases.

## Recommended Stack

- React + Vite + TypeScript
  Reason: fastest clean start, strong DX, easy static hosting, matches project guidance.
- Tailwind CSS
  Reason: fast iteration for a polished UI system without heavy component-library lock-in.
- TanStack Query
  Reason: caching, loading/error handling, refetch control, and cleaner API-state management.
- Zod
  Reason: validate external API responses before UI consumption.
- React Router
  Reason: optional but recommended from the start for future expansion, even if milestone 1 initially ships as a single route.
- Vitest + Testing Library
  Reason: lightweight test setup aligned with Vite and React.

## API Decision

### Compared options

- `football-data.org`
  - Best fit for milestone 1.
  - Free tier includes Premier League, La Liga, Bundesliga, Serie A, and Ligue 1.
  - Provides league tables and scorers.
  - Browser access is feasible and their docs explicitly describe CORS handling.
  - Main drawback: free tier is limited and deeper statistics are not as rich as larger paid products.
- `API-Football`
  - Richer overall dataset and better long-term feature depth.
  - Free tier exists, but it is quota-constrained and depends on a private API key in request headers.
  - Better as a future upgrade path than as the initial static-first source.
- `TheSportsDB`
  - Very accessible and inexpensive.
  - Better for broad hobby use than for a polished standings-first football product where data consistency matters most.
  - Less ideal as the primary source for this milestone.
- `Sportmonks`
  - Strong product and data quality.
  - Not a true free long-term option for the intended launch path.

### Recommendation

Use `football-data.org` for milestone 1.

### Backend / proxy decision

Do not add a backend or proxy in milestone 1 by default.

Use a static frontend first, with the API token supplied through Vite env configuration during development and deployment. This is acceptable only for milestone 1 because the chosen source is free-tier friendly and the product is still early-stage.

Plan the data layer behind a small internal client abstraction so a proxy can be introduced later if any of these become true:

- key exposure becomes unacceptable,
- rate limits become a real issue,
- production hosting needs stricter secret protection,
- the project upgrades to `API-Football` or another provider that should not be called directly from the browser.

## Public Interfaces And Data Contracts

Create internal app-facing types so the UI does not depend directly on raw provider responses.

### Core internal types

- `LeagueKey`
  - `premier-league`
  - `la-liga`
  - `bundesliga`
  - `serie-a`
  - `ligue-1`

- `LeagueConfig`
  - internal key
  - display name
  - country
  - provider competition code
  - accent/theme metadata

- `StandingRow`
  - position
  - team id
  - team name
  - crest url
  - played
  - wins
  - draws
  - losses
  - goalsFor
  - goalsAgainst
  - goalDifference
  - points
  - recentForm optional

- `LeagueSummary`
  - leader
  - bestAttack
  - bestDefense
  - bestGoalDifference
  - currentMatchday optional
  - season label

- `TopScorer`
  - player id
  - player name
  - team name
  - goals
  - penalties optional

- `LeagueDashboardData`
  - league metadata
  - summary
  - standings
  - topScorers
  - fetch timestamp

### Response validation

- Validate provider responses with Zod at the API layer.
- Map provider shapes into stable internal types before they reach components.
- Treat missing scorer/form data as partial-success UI states, not app-fatal errors.

## Implementation Changes

### App foundation

- Scaffold a new Vite React TypeScript app in the existing repo.
- Add Tailwind, TanStack Query, Zod, and test tooling.
- Establish a simple app structure:
  - `src/app` for app shell/providers/router
  - `src/features/standings` for milestone UI
  - `src/shared` for UI primitives, config, utils, and types
  - `src/lib/api` for provider client and schema mapping
- Add `.env.example` once API env vars are introduced.

### Data layer

- Add a small football-data client with:
  - competition config for the 5 leagues,
  - standings fetcher,
  - scorers fetcher,
  - normalization/mapping functions,
  - typed query keys for TanStack Query.
- Prefer one query per selected league dashboard rather than fetching all 5 in parallel on initial load.
- Derive summary cards from standings data locally.
- If recent form is not consistently available from the selected endpoint/tier, show form only when data exists and document the fallback.

### UI / UX direction

- Build a distinct football editorial look rather than a generic admin table.
- Use a custom visual system with:
  - bold typography,
  - strong spacing rhythm,
  - league-specific accent colors,
  - layered backgrounds/surfaces,
  - polished hover/focus/transition behavior.
- Core milestone components:
  - app shell/header
  - league selector
  - league hero/header block
  - summary stat cards
  - responsive standings table
  - mobile standings card list
  - top scorers panel
  - loading skeletons
  - empty state
  - recoverable error state
- Mobile behavior:
  - card-based standings on narrow screens,
  - sticky league selector or compact tab row,
  - preserved readability for numbers and team names.

### State and UX behavior

- Default landing league: Premier League.
- Cache fetched league data and avoid excessive refetching.
- Show:
  - page-level loading state on first load,
  - section-level loading states on league switch,
  - non-blocking degraded states when scorers or form are unavailable,
  - retry affordance on failure.
- Include attribution text required by the provider in a visible footer/help area.

### Docs changes to make during implementation

- Create `docs/plans/milestone-1-standings.md` with this plan.
- Update `README.md` with:
  - project goal,
  - milestone scope,
  - chosen stack,
  - chosen API,
  - env setup instructions,
  - local run/test commands,
  - static-hosting-first architecture note.

## Implementation Phases

### Phase 1: Project foundation

- Scaffold Vite + React + TypeScript.
- Add Tailwind, TanStack Query, Zod, Vitest, Testing Library.
- Set up base folder structure, app providers, and design tokens.
- Create README baseline and `.env.example`.

### Phase 2: Data integration

- Add league config for the top 5 leagues.
- Implement football-data client and Zod schemas.
- Build normalized mappers for standings, summary cards, and scorers.
- Add query hooks for selected league data.

### Phase 3: Dashboard UI

- Build the visual shell and responsive layout.
- Add league selector and league hero/header.
- Add summary cards derived from standings.
- Add standings table and mobile alternative.
- Add top scorers panel.
- Add optional recent-form display when available from mapped data.

### Phase 4: Reliability and polish

- Implement loading, empty, partial-data, and error states.
- Add accessibility improvements for keyboard navigation and table semantics.
- Tune query stale times and transition behavior.
- Add provider attribution and deployment notes.

### Phase 5: Verification and docs

- Add tests for mapping/validation and critical UI states.
- Run build and test checks.
- Finalize `docs/plans/milestone-1-standings.md`.
- Update `PLANS.md` status and README project info.

## Test Plan

- Unit tests for response mappers and Zod validation.
- Unit tests for derived summary-card logic.
- Component tests for:
  - league selector interaction,
  - standings success state,
  - loading state,
  - error state,
  - empty/partial state,
  - scorers panel rendering.
- Manual checks:
  - desktop and mobile layouts,
  - league switching behavior,
  - retry flow after failed request,
  - long team names,
  - missing crest/image fallback,
  - accessible focus states and screen-reader labels.
- Build verification:
  - production build succeeds,
  - no secret is hardcoded in repo files.

## Risks And Defaults

- Risk: free-tier API quotas may be tight.
  Default: fetch only the active league on demand and rely on query caching.
- Risk: form/stat richness may not be uniform.
  Default: summary cards are guaranteed from standings data; form/scorers are additive and may degrade gracefully.
- Risk: browser-exposed API token may be unsuitable later.
  Default: keep the data layer abstract so a proxy can be introduced without refactoring UI components.
- Risk: no current frontend conventions exist in the repo.
  Default: establish conventions during scaffold and document them in README.

## Assumptions

- Milestone 1 is a frontend-only release target.
- Hostinger/static hosting remains the preferred deployment path.
- “League summary cards” means derived overview metrics from standings, not advanced paid analytics.
- “Team form + scorers” means planning for recent-form presentation where supported and a top-scorers panel from the API.
- No implementation happens in this step; file creation and README updates occur in the next execution step.
