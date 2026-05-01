# Football Galaxy

Football Galaxy is a polished football web app focused on excellent UI/UX.

The first milestone is a standings dashboard for the top 5 European leagues:

- Premier League
- La Liga
- Bundesliga
- Serie A
- Ligue 1

This repository currently contains a working standings dashboard foundation with live league table integration:

- React + Vite + TypeScript
- Tailwind CSS
- TanStack Query
- Zod
- Vitest + Testing Library
- TheSportsDB free API integration

## Current Scope

The current app includes:

- app shell
- URL-driven league switching
- live standings for the top 5 European leagues
- responsive standings table and mobile cards
- derived summary cards
- loading, error, and empty states
- design tokens and premium dashboard styling

## Tech Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- Zod
- Vitest
- Testing Library

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run the test suite:

```bash
npm run test
```

Run the production build:

```bash
npm run build
```

## Environment Variables

The dashboard uses TheSportsDB free API. By default it works with the public free key `123`, so no registration is required to run the current standings experience.

Optional override:

```bash
VITE_THESPORTSDB_API_BASE_URL=https://www.thesportsdb.com/api/v1/json
VITE_THESPORTSDB_API_KEY=123
```

## Project Structure

```text
src/
  app/                 App shell, router, providers
  features/            Feature modules
  pages/               Route-level pages
  services/            API providers, schemas, queries, mappers
  shared/              Shared UI, config, types, styles, utilities
```

## Product Direction

The finalized milestone direction is:

- static-first MVP
- `TheSportsDB` free API (`123` public key, no signup required)
- standings + derived summary cards only

Richer statistics, scorers, and form are intentionally deferred to a later milestone to keep the first release simple, polished, and easy to host.
