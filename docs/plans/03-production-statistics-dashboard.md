# Production Statistics Dashboard Plan

## Summary

Adapt the existing Vite project into the requested Football Galaxy dashboard with route-level code splitting, a context-driven live/historical data-source system, shadcn-style UI primitives, mock-first football data, and static-hosting friendly services.

## Requirements

- Use Vite 5, React 18, TypeScript 5.5, Tailwind CSS 3.4, React Router 6, Recharts 2, TanStack Table 8, Framer Motion 11, embla, cmdk, date-fns, lucide-react, and next-themes.
- Keep application state in React Context and `useReducer`.
- Provide the mandatory route structure: league dashboard, team detail, player detail, and compare.
- Make every route lazy via `React.lazy` and wrap route content in `Suspense`.
- Support live and historical data modes with identical TypeScript return types.
- Run without `.env` by silently falling back to local mock data.
- Include loading, empty, error, dark mode, command palette, favorites, and print styles.

## Architecture

- `src/App.tsx` owns provider order and router layout.
- `src/contexts` owns data-source and favorites reducers.
- `src/services` exposes live and historical functions with identical names.
- `src/hooks/useFootballData.ts` selects the correct service based on context.
- `src/data/mock` provides realistic generated league data per league.
- `src/components/layout` owns desktop/mobile navigation and page transitions.
- `src/components/league`, `team`, and `player` own feature widgets.
- `src/components/ui` contains local shadcn-style primitives.

## Risks

- `football-data.org` free endpoints do not provide all rich player/team statistics, so live mode enriches partial API responses with mock data where needed.
- The existing repository had a different architecture and dependency set. The old feature folders remain on disk but are removed from the TypeScript compile path to avoid destructive deletion without explicit approval.
- Generated mock data is deterministic and realistic enough for UI/product work, but not a licensed real-statistics dataset.

## Verification

- `npx tsc --noEmit`
- `npm run build`
- Manual browser check for `/premier-league`, `/team`, `/player`, `/compare`, mobile width, dark mode, Cmd/Ctrl+K, and favorites persistence.
