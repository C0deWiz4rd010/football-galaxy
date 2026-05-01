# Football Galaxy

Football Galaxy is a polished football web app focused on excellent UI/UX.

The first milestone is a standings dashboard for the top 5 European leagues:

- Premier League
- La Liga
- Bundesliga
- Serie A
- Ligue 1

This repository currently contains the Phase 1 project foundation:

- React + Vite + TypeScript
- Tailwind CSS
- TanStack Query
- Zod
- Vitest + Testing Library

## Current Scope

Phase 1 sets up the app foundation only:

- project scaffold
- app shell
- routing foundation
- global styles and design tokens
- testing setup
- folder structure for future features and services

Not included yet:

- API integration
- standings data
- feature-specific UI components
- business logic

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

Phase 1 does not call any external API yet, but `.env.example` is included so the project is ready for Phase 2.

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
- `football-data.org`
- standings + derived summary cards only

Richer statistics, scorers, and form are intentionally deferred to a later milestone to keep the first release simple, polished, and easy to host.
