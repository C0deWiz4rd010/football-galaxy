# Final Product Direction: Milestone 1

## Summary

Choose **Option A**.

Milestone 1 should be a **static-first MVP** using **`football-data.org`** and focused on **standings + derived summary cards only** for the top 5 European leagues.

This is the strongest choice for the first implementation because it best fits the project’s current priorities: polished UI/UX, simple architecture, low delivery risk, and easy Hostinger-compatible deployment. It also avoids introducing backend complexity before we have validated the core product experience.

**Implementation can safely start.**

## Final Decision

### Chosen approach

- **Static-first MVP**
- **React + Vite + TypeScript**
- **Tailwind CSS with design tokens and custom component styling**
- **TanStack Query + Zod**
- **`football-data.org`**
- **No backend/proxy in milestone 1**

### Why Option A wins

#### UI/UX quality goals

- The first milestone does not need deep football data to feel premium.
- A polished standings experience depends more on:
  - layout quality,
  - typography,
  - spacing,
  - responsive behavior,
  - loading/error states,
  - smooth league switching,
  - visual identity,
  than on extra data panels.
- A narrower scope gives more time to make the standings dashboard feel intentional and high-end.

#### Long-term scalability

- Option A does not block future growth.
- We can still prepare a provider abstraction now, so later migration to `API-Football` or a proxy is straightforward.
- This keeps milestone 1 focused while preserving a clean upgrade path for scorers, fixtures, team pages, and richer stats.

#### Development complexity

- Option B adds several risks immediately:
  - proxy/serverless design,
  - API key protection,
  - more endpoints,
  - more failure modes,
  - more loading combinations,
  - more UI surface before the core dashboard is proven.
- That complexity is not justified for the first shipped milestone.

#### Hosting constraints

- Option A aligns best with **Hostinger static hosting**.
- No backend means:
  - simpler deployment,
  - lower operational overhead,
  - easier local setup,
  - fewer moving parts.

#### API limitations

- `football-data.org` is sufficient for:
  - league standings,
  - league metadata,
  - derived summary cards.
- It is not ideal for a rich form/scorers product, but that is exactly why those items should be moved out of milestone 1 instead of forcing the architecture to become more complex now.

## Final Milestone Scope

### Included

Milestone 1 includes:

- Top 5 leagues:
  - Premier League
  - La Liga
  - Bundesliga
  - Serie A
  - Ligue 1
- League selector
- Responsive standings dashboard
- Desktop standings table
- Mobile-friendly standings card/list layout
- Derived summary cards based on standings data, such as:
  - current leader
  - best attack
  - best defense
  - best goal difference
- Premium visual direction for the dashboard
- Loading state
- Error state
- Empty state
- Accessible interactions and readable responsive layout
- Static-hosting-friendly frontend architecture
- Internal provider abstraction and response validation

### Explicitly not included

Milestone 1 does **not** include:

- Top scorers
- Team form panels
- Fixtures
- Match details
- Team detail pages
- Player pages
- Authentication
- Favorites
- Backend/proxy
- Paid API integrations
- Live data features
- Advanced analytics/statistics beyond standings-derived summaries

## Updated Architecture Direction

### Stack

Keep:

- React
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- Zod
- Vitest + Testing Library

### Frontend structure

Use this structure:

- `src/app`
  - providers, app shell, router, global styles
- `src/pages`
  - `dashboard`
- `src/features`
  - `league-selector`
  - `standings-table`
  - `league-summary`
- `src/shared`
  - `ui`, `config`, `lib`, `types`, `assets`
- `src/services`
  - `football-provider`
  - `schemas`
  - `mappers`
  - `queries`

### Routing

- Introduce **minimal routing now**.
- Start with `/`.
- Structure it so future routes can be added cleanly:
  - `/league/:leagueKey`
  - `/team/:teamId`

This is a low-cost improvement that prevents future restructuring.

### Data layer

Use a provider boundary now, even with one provider.

Internal contract should support at least:

- `getStandings(leagueKey)`
- `getLeagueDashboard(leagueKey)`

`getLeagueDashboard` should return:

- league metadata
- standings
- derived summary cards
- fetch timestamp

Components must consume only normalized internal models, never raw API payloads.

## UI / UX Direction

### Final visual direction

Use **Editorial Matchday** as the app’s design direction.

### Feel

Target a blend of:

- `FotMob` clarity and football-first density
- `Apple Sports` polish and restraint
- `The Athletic` editorial confidence

Avoid:

- cluttered sports portals,
- generic admin dashboards,
- flat white-table layouts.

### Layout system

- Strong league header/hero at the top
- League selector integrated into the hero or just beneath it
- Summary cards immediately below
- Standings as the main focal block
- On mobile:
  - horizontal selector,
  - stacked summary cards,
  - readable compact standings cards

### Styling guidance

- Tailwind should be used with:
  - CSS variables for tokens,
  - consistent spacing scale,
  - custom color system,
  - custom table/card primitives.
- Do not rely on a ready-made component library for the core experience.

## Adjusted Implementation Phases

### Phase 1: Foundation

- Scaffold Vite React TypeScript app
- Add Tailwind, TanStack Query, Zod, testing setup
- Add app shell, router, providers, folder structure
- Define design tokens and base global styles
- Add `.env.example`
- Update README with project purpose and setup

### Phase 2: Data layer

- Add top-5 league configuration
- Implement `football-data.org` client
- Add Zod schemas and normalized mappers
- Add provider interface and query hooks
- Model derived summary-card data from standings

### Phase 3: Dashboard UI

- Build league selector
- Build league header/hero
- Build summary cards
- Build responsive standings table/card layout
- Add polished loading, empty, and error states

### Phase 4: Reliability and polish

- Improve accessibility
- Add crest/logo fallback behavior
- Tune caching and state transitions
- Add provider attribution
- Refine mobile and tablet presentation

### Phase 5: Verification and docs

- Test mapping logic and key UI states
- Run build/test verification
- Finalize README and planning docs
- Mark milestone plan status appropriately in `PLANS.md`

## Data Layer Decisions

### Keep

- Zod validation
- normalized internal types
- provider abstraction
- per-league fetching with caching

### Remove from milestone 1

- scorer fetchers
- form-strip feature
- partial-success states for scorer/form panels
- proxy/backend planning as an implementation concern

### Defer to milestone 2+

- richer statistics endpoints
- alternate provider migration
- backend-for-frontend layer
- paid API strategy

## Risks And Guardrails

- Risk: exposed browser API token may still be limiting later.
  Default: acceptable for milestone 1; keep provider boundary ready for migration.
- Risk: missing/uneven crest assets.
  Default: add fallback initials/placeholder treatment.
- Risk: scope creep toward fixtures/scorers/team pages.
  Default: keep milestone 1 strictly standings-focused.
- Risk: Tailwind class sprawl.
  Default: enforce shared UI primitives and token-based styling from the start.

## Assumptions

- Hostinger-compatible static deployment remains the preferred release target.
- Premium UI is a higher priority than breadth of football data in milestone 1.
- Richer stats, scorers, and form are important, but belong in the next milestone once the dashboard foundation is proven.

