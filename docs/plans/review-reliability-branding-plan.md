# Football Galaxy Review, Reliability, and Branding Plan

## Context

This plan captures the current review outcome for the dashboard reliability issue, data completeness checks, and the first branding pass.

It also defines the next implementation sequence so the app can move from visually polished prototype to stable product.

## What Was Verified

- The dashboard route renders content into the DOM.
- Public live endpoints used by the browser hit CORS restrictions.
- Local mock data is structurally complete enough to keep the product functional.
- Sidebar branding and favicon were replaced with a Football Galaxy-specific mark.
- A dedicated mock-data completeness test now validates teams, squads, player images, flags, and key stats.

## Current Findings

### High Priority

- Browser live-data access is not production-safe without a proxy or server-side fetch path.
- The opened preview instance can lag behind source changes when it serves a stale build; restart preview after meaningful asset or routing changes.

### Medium Priority

- `src/services/footballData.ts` still exposes a stubbed `searchIndex` and should be replaced by a real catalog source for command/search reliability.
- `src/components/shared/DataSourceToggle.tsx` is currently presentational only and does not reflect actual runtime source switching.
- README and UI language still contain some historical wording around "live" even when local fallback data is the active runtime path.

### Low Priority

- `EA FC` remains a product mode teaser rather than a functional route/domain boundary.
- Historical coverage is uneven across leagues and seasons, so multi-season depth is still limited.

## Recommended Agent Setup

The web research pointed to two strong patterns:

- Anthropic recommends simple composable workflows first, then routing, parallelization, orchestrator-workers, and evaluator-optimizer only when the task justifies it.
- Microsoft recommends starting with the lowest-complexity orchestration that works, then combining sequential, concurrent, and maker-checker style patterns only where specialization adds value.

For Football Galaxy, the recommended working set is:

1. Orchestrator / Product Manager Agent
   - Use for open-ended feature slices that touch routing, data, UI, and docs together.
   - Pattern: magentic or orchestrator-workers.

2. Frontend Data-Viz / UI-UX Agent
   - Specialize on dense football tables, comparison views, filters, scanning behavior, and mobile adaptation.
   - Pattern: concurrent specialist or routed specialist.

3. Code Architect Agent
   - Own boundaries across data providers, cache strategy, shared types, and page/component decomposition.
   - Pattern: sequential planner before implementation.

4. Code Reviewer Agent
   - Run as maker-checker after each feature slice.
   - Focus on regressions, data assumptions, stale UI states, and missing tests.

5. Data QA Agent
   - Validate completeness, image coverage, league/team/player integrity, and fallback assumptions.
   - Pattern: concurrent validation or evaluator-optimizer loop.

## Proposed Execution Plan

### Phase 1: Runtime Reliability

- Keep browser default on local fallback data.
- Add an explicit runtime status badge that distinguishes local fallback from proxied live data.
- Add a documented proxy path for real live fetching.
- Add preview/dev scripts that make stale-build states less likely.

Success criteria:

- No browser-visible CORS failures in the default developer flow.
- Dashboard loads consistently on first render.
- Team, player, and league pages share the same source semantics.

### Phase 2: Data Integrity

- Expand automated completeness tests beyond mock data to mapped live-service outputs where feasible.
- Audit historical coverage league by league and season by season.
- Add a small diagnostics panel or internal report for missing player images, empty squads, and fallback usage rates.

Success criteria:

- Missing-image and missing-squad cases are measurable.
- Historical gaps are documented instead of silently falling through.
- Data regressions fail in CI.

### Phase 3: Search and Discovery

- Replace the stubbed `searchIndex` with a real derived search catalog.
- Unify command palette, explorers, and compare entry points around one normalized source.
- Add league/team/player metadata weights for better search ranking.

Success criteria:

- Search returns real players and teams from active runtime data.
- Command palette and explorers stay in sync.

### Phase 4: Branding and Product Polish

- Roll the new Football Galaxy brand mark through header, social preview image, and app metadata.
- Create a dedicated app icon set for browser tabs and mobile install surfaces.
- Tighten copy so local fallback, live service, and EA FC mode are clearly distinguished.

Success criteria:

- Brand is consistent across sidebar, tab icon, and shared assets.
- No misleading runtime labels remain.

### Phase 5: Live Data Architecture

- Introduce a server or edge proxy for ESPN/TheSportsDB aggregation.
- Validate and normalize remote payloads with Zod schemas.
- Cache league summary, squads, and player imagery with graceful degradation.

Success criteria:

- Live mode becomes a real product capability instead of a browser best-effort path.
- API failures degrade into known fallback states, not silent UX mismatches.

## Validation Checklist For Future Slices

- `npm test`
- `npm run lint`
- `npm run build`
- Browser check on a fresh preview instance after asset or route changes

## Immediate Next Steps

1. Add a real runtime data-source indicator in the header and dashboard hero.
2. Replace `searchIndex` with a normalized search catalog derived from teams and players.
3. Decide whether live data should use a lightweight proxy or remain a curated local-first product for the next milestone.