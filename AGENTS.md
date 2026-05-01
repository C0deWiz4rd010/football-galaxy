# Football Galaxy — Agent Instructions

## Project Goal

Football Galaxy is a polished football web app focused on excellent UI/UX.

The first milestone is a standings and statistics dashboard for the top 5 European leagues:

- Premier League
- La Liga
- Bundesliga
- Serie A
- Ligue 1

The app should start simple, clean, and maintainable. It should be easy to expand later with more statistics, team pages, fixtures, player data, browser-game features, and hosting via Hostinger.

## Core Principles

- Plan before coding.
- Prefer small, incremental changes.
- Keep architecture simple until complexity is justified.
- Prioritize UI/UX quality.
- Use readable, maintainable code.
- Avoid over-engineering.
- Never commit API keys, secrets, tokens, or credentials.
- Use environment variables for API keys.
- Add `.env.example` when environment variables are introduced.
- Always include loading, empty, and error states for API-driven UI.
- Keep the app hostable as a static frontend if possible.
- Use a backend/proxy only if needed for API key protection, CORS, or rate limits.

## Preferred Initial Stack

Default recommendation:

- React
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query for API fetching/caching
- Zod for validating external API responses

Do not choose Angular, Next.js, or a backend unless the planning step clearly justifies it.

## Agent Workflow

For new features, use this workflow:

1. `code-explorer`
   - Inspect the repository.
   - Understand existing files, package setup, conventions, and constraints.

2. `planner`
   - Create a phased implementation plan.
   - Include requirements, files, risks, tests, and success criteria.

3. `code-architect`
   - Define concrete file structure, component boundaries, data flow, and build order.

4. Implementation
   - Make small, focused changes.
   - Keep commits and diffs understandable.

5. `code-reviewer`
   - Review all changes before finalizing.
   - Check security, maintainability, tests, and React/TypeScript quality.

## Planning Requirements

Before implementing a new feature, create or update a plan in:

```txt
docs/plans/