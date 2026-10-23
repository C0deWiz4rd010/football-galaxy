# Plan 17 — Datenbeschaffung, Mobile-First & neue Features

Status: In Umsetzung · Erstellt: 2026-07-29

## Ziel

Jeden Aspekt der App verbessern mit Hauptfokus **Datenbeschaffung**, gefolgt von
**Mobile-First-UX** und **neuen Features**. Free-Quellen maximal ausreizen, neue
Free-APIs integrieren und synthetische Spielerdaten durch echte ersetzen.

## Entscheidungen (User)

- **Free-only**: Keine Paid-APIs, keine neuen Keys (fd.org optional).
- **1B**: Understat/xG-Scraping **gestrichen** (unzuverlässig). Advanced-Stats nur
  mit Feldern, die ESPN/football-data.org tatsächlich liefern.
- **Feature-Reihenfolge**: Live-Ticker **zuerst**, danach erweiterter
  Spielervergleich, Advanced-Stats optional zuletzt.
- Prioritäten: 1) Datenqualität & Zuverlässigkeit 2) Mobile-First UX 3) Features.

## IST-Zustand (verifiziert)

- App ist LIVE-ONLY. Ligen-Cascade: `theSportsDb` → `footballDataOrg`
  (`src/services/footballData.ts`). Kein persistenter Cache.
- Hook `src/hooks/useFootballData.ts` nutzt einen In-Memory-Module-Cache
  (verloren bei Reload), kein TanStack Query.
- TanStack Query nur in `src/services/queries/use-league-standings.ts`.
- Proxy `proxy/football-data-proxy.mjs`: `/api/live?target=`, TTL-Cache 60s,
  serve-stale bei 429/5xx. Allowlist enthält **bereits ESPN**, Wikidata,
  Wikimedia.
- Explorer-/Spielerstats sind **synthetisch** via `src/lib/explorer-data.ts`.
- WM 2026: fd.org WC → Snapshot. Keine Lineups/Events/xG im Free-Tier.

## Neue Free-Datenquellen

- **ESPN Hidden API** (bereits in Allowlist): `scoreboard` (Live-Scores +
  Events), Team-Roster + Athlete-Stats → Live-Ticker + echte Spielerstats für
  alle Top-5.
- **OpenLigaDB** (kein Key): Bundesliga Live-Minuten-Tore/Tabelle → Redundanz.
- Understat: **entfällt** (Entscheidung 1B).

## Phase 1 — Datenfundament & Zuverlässigkeit

1. Persistenter Stale-While-Revalidate-Cache
   (`src/services/cache/persistentCache.ts`, localStorage/IndexedDB, TTL). In
   `useFootballData.ts` einbinden: sofort stale servieren, im Hintergrund
   revalidieren. Reload-fest.
2. Request-Scheduler/Queue: Dedupe gleicher In-Flight-Requests + Throttle
   (<10/min fd.org) + Retry mit Backoff bei 429.
3. Datenqualität-Metadaten durchreichen (`{source, freshness, fetchedAt}`) →
   `DataSourceBadge.tsx` zeigt echte Frische ("vor X min").
4. Zod-Validierung auf scorers/matches/teams/players ausweiten.

## Phase 2 — Neue Free-Quellen + echte Spielerstats

5. ESPN-Provider `src/services/espn/` — scoreboard + roster + athlete stats;
   Mapper → Domain. In `footballData.ts` cascade für `getMatches` (live) +
   neuer `getPlayerStats`.
6. OpenLigaDB-Provider `src/services/openLigaDb/` — Bundesliga Live/Tabelle als
   zusätzliche Cascade-Stufe (Host in Proxy-Allowlist ergänzen).
7. Echte Spielerstats: `PlayersExplorer.tsx` + `PlayerDetail.tsx` von
   `explorer-data.ts` (Mock) auf ESPN migrieren; Mock nur Last-Resort.

## Phase 3 — Neue Features (Live-Ticker zuerst)

8. **Live-Match-Ticker** `src/features/live/` — ESPN scoreboard Polling
   (`refetchIntervalMs`, nur bei sichtbaren Live-Spielen). Minute/Tore/Karten.
   Eintrag in Sidebar + MobileTabBar.
9. Spielervergleich erweitern (`Compare.tsx`, `player/RadarChart.tsx`) — mehr
   Metriken, Perzentil-Balken, bis zu 3 Spieler (echte Stats).
10. Advanced-Stats-Visualisierung **nur** mit vorhandenen ESPN/fd.org-Feldern
    (Schüsse, Ballbesitz); echtes xG entfällt.

## Phase 4 — Mobile-First Politur jeder View

11. WM-2026-Seiten sm/md-Breakpoints (`src/pages/world-cup/WorldCupPages.tsx`,
    `src/features/world-cup/components.tsx`).
12. Galaxy Map (`src/features/galaxy-map/`) mobil responsiv.
13. Shell-Fixes: Compare-FAB z-order über TabBar; MatchdaySwiper
    Scroll-Affordance; TabBar 320px-Test.
14. Tokenisierung abschließen (hart codierte `rounded-*`/`p-*` → `fg-*`);
    Touch-Targets ≥44px.

## Phase 5 — Verifikation

15. `npm run lint`, `npm test`, `npm run build` grün.
16. Neue Vitest-Tests: persistentCache, requestQueue, ESPN/OpenLigaDB-Mapper
    (Zod gegen Fixtures).
17. Manuelle QA @360/390/430/768/1024/1280px alle Views + 6 Paletten
    light/dark; Live-Ticker-Polling; Rate-Limit-Verhalten (stale-serve).

## Scope-Grenzen

- Keine Paid-APIs/neuen Keys. Kein kompletter TanStack-Query-Rewrite.
- Keine Verletzungen/News (keine verlässliche Free-Quelle).
- Kein PWA/Push (persistenter Cache ja).
