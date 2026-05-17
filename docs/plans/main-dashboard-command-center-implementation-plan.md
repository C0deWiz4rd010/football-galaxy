# Main Dashboard Command Center Implementation Plan

Date: 2026-05-17

## Summary

Turn the accepted Data Command Center concepts into the next Football Galaxy dashboard pass. The goal is a compact, interactive football analytics surface where the table, team detail, and player profile communicate the most important live facts in one scan.

## Phase 1: Data Honesty And Reliability

- Keep live adapters honest: upstream failures throw so the facade can use football-data.org or local fallback deliberately.
- Delete rejected league and ESPN squad promises from caches so a stopped proxy or temporary ESPN failure can recover after refetch.
- Build live leaderboards only from complete ESPN roster coverage. If coverage is incomplete, use the next live provider or local fallback rather than mixing generated players into live lists.
- In the league dashboard, show Live Proxy only when the summary has a live `lastUpdated` value; otherwise display Local Fallback.

## Phase 2: Main Dashboard

- Rework the league header toward the main concept: compact identity, season/matchday/source, leader, best attack, best defense, and form leader in one shallow band.
- Keep the standings table visible immediately below the header, with legend directly attached to the table.
- Convert the right column into an insights rail: spotlight player with photo, top scorers, top assists, upcoming/recent matches, and data freshness.
- Preserve the current sidebar rule: all top-five leagues visible without inner scroll and favorites secondary.

## Phase 3: Team Detail

- Move team identity, table rank, points, goal difference, form, manager, stadium, squad size, and next fixture into a compact top band.
- Make the squad table the primary object on desktop, including player photo, position, age, nationality, appearances, goals, assists, yellow cards, and form.
- Keep tactical view, top performer, strengths/weaknesses, and recent results as supporting right/bottom panels.

## Phase 4: Player Detail

- Use the player concept as the compact target: portrait, identity, availability, team, position, age, nationality, production tiles, cards, minutes, rating, and form above the fold.
- Keep recent match log, contribution chart, role comparison, similar players, heatmap, and contract/market context visible in a dense dashboard grid.
- Prefer code-native charts/tables and verified player imagery; generated avatar remains the final fallback only.

## Phase 5: QA And Publish

- Run `npm.cmd run lint`, `npm.cmd test -- --reporter=dot`, and `npm.cmd run build`.
- Browser-check production preview at `/la-liga`, a team detail route, and a player detail route.
- Confirm production hides the Local tab, dev can use Local mode, and fallback data is not labeled as fresh live data.
- Push branch `codex/data-command-center-dashboard-concepts` and open a draft PR against `develop`.

## Acceptance Criteria

- Concepts are saved under `docs/concepts/` with prompts and UX notes.
- Live-data fallback is honest and cache recovery is fixed.
- The implementation plan is documented and can be handed to another engineer without design decisions.
- Local checks and browser QA pass before publish.

## Follow-up Implementation Notes

Date: 2026-05-17

- Main league dashboard now follows the concept more closely: compact header stats first, table as the primary left object, and a right insights rail for spotlight player, top scorers, top assists, match card, and data freshness.
- The standings table was compressed toward the concept anatomy: `Tore` combines goals for/against, `TD`, `Pkt`, and `Form` remain visible in the table-first layout.
- The loading state now renders an explicit table-first skeleton with labels, so opening or switching a league no longer looks like an empty main view while live data resolves.
- Browser QA must cover all five league nav links after every dashboard layout change.
