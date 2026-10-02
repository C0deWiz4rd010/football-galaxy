
## `PLANS.md`

```md
# Football Galaxy — Planning Index

This file tracks active and completed plans for the project.

## Project Vision

Football Galaxy will become a polished football platform for standings, statistics, fixtures, teams, players, and possibly browser-game features later.

The project should grow step by step:

1. Start with a strong frontend foundation.
2. Add top 5 league standings.
3. Add richer statistics.
4. Add team detail pages.
5. Add fixtures and match details.
6. Add browser-game or interactive features.
7. Prepare selected projects/features for hosting.

## Active Plans

| Plan | Status | Description |
|------|--------|-------------|
| [`docs/plans/19-perfection-overhaul.md`](docs/plans/19-perfection-overhaul.md) | active | Phased overhaul: bugs, TanStack Query data layer, design system, responsiveness, performance, a11y, i18n, Hostinger deploy, SEO |

## Completed Plans

Plans 00–18 are completed or superseded. See the full chronological index in
[`docs/plans/README.md`](docs/plans/README.md).

## Planning Rules

Every meaningful feature should have a plan before implementation.

A good plan should answer:

- What are we building?
- Why are we building it?
- Which files will be created or changed?
- Which API or data source will be used?
- How will the data flow through the app?
- What can go wrong?
- How will we test it?
- What does “done” mean?

## Milestone 1 Target

Create a beautiful, responsive football standings dashboard for:

- Premier League
- La Liga
- Bundesliga
- Serie A
- Ligue 1

Minimum UI requirements:

- League selector
- Standings table/card layout
- Team name and position
- Played matches
- Wins
- Draws
- Losses
- Goals for
- Goals against
- Goal difference
- Points
- Loading state
- Error state
- Empty state
- Mobile-friendly layout

## Technical Preferences

Default stack unless planning proves otherwise:

- React
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- Zod

## Hosting Considerations

The app should remain easy to host.

Preferred path:

1. Static frontend build
2. Host on Hostinger or similar
3. Add backend/proxy only when needed

If an API requires secret keys that cannot be exposed in the browser, document the backend/proxy decision before implementation.