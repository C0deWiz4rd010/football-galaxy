# Plan 18 — Release-Ready Overhaul

Status: In Umsetzung · Branch: `develop` · Datum: 2026-07-31

## Ziel

White-Screen und sehr lange Ladezeiten beseitigen, garantieren dass **immer Daten
ankommen** (live-only bleibt, aber die kostenlose Cascade wird gehärtet), Tests für
Datenverfügbarkeit, UI/UX-Politur + visueller Redesign, und **Release-Ready** inkl.
deploybarem Proxy und GitHub-Pages-Deploy.

## Entscheidungen des Nutzers

- **Kein** Snapshot-Fallback für Ligen — live-only bleibt. Stattdessen Cascade mit mehr
  kostenlosen Quellen härten (keyless ESPN!).
- football-data.org API-Key vorhanden; Proxy soll mit deployt werden (Node/Serverless).
- Voller Umfang: Stabilität + Performance + Tests + Release **und** UI/UX-Politur **und**
  visueller Redesign.
- Nur kostenlose Datenquellen.

## Root Causes (verifiziert)

1. Kein Proxy läuft (`npm run dev` statt `dev:all`) → alle Live-Requests scheitern nach
   ~3,5 s Retries. `liveProxy.ts` DEV-Default = `http://localhost:8787/api/live`.
2. Keine `.env` (nur `.env.example`) → `FOOTBALL_DATA_API_KEY` fehlt → Free-Tier/kein Auth.
3. Keine Liga-Fallbackdaten (live-only) → ohne Proxy/Netz Fehler-UI.
4. `Sidebar.tsx` importiert `mockData` (alle 5 Ligen, ~450 kB) synchron → blockt FCP.
5. **Keine** ErrorBoundary → jeder Render-Fehler = kompletter White-Screen.

## Kostenlose Quellen (verifiziert)

- **ESPN hidden API** (keyless), Top-5-Slugs `eng.1/ger.1/esp.1/ita.1/fra.1`, bereits in der
  Proxy-Allowlist und für Live-Scores genutzt. Standings/Scorers verfügbar → neuer keyless
  Provider.
- **OpenLigaDB** keyless (Bundesliga) — schon integriert.
- **TheSportsDB** free key `123` (primär), **football-data.org** free tier (mit Key).

## Phasen

### Phase 0 — Dev funktioniert sofort
- `.env` aus `.env.example` (User trägt Key ein). `.env.example` bleibt Referenz.
- In-App-Proxy-Healthcheck: Banner/Toast wenn Proxy offline statt endlosem Laden.
- README/AGENTS: `dev:all` als Standard-Dev-Flow dokumentieren.

### Phase 1 — White-Screen & First-Paint
- `AppErrorBoundary` an der App-Wurzel + `RouteErrorBoundary` um Suspense/`Outlet`.
- `Sidebar.tsx`: `mockData` aus dem kritischen Pfad entfernen.

### Phase 2 — Robuste kostenlose Cascade (immer Daten)
- Neuer `src/services/espn/standings.ts` (keyless Standings + Scorers).
- `footballData.ts` Cascade erweitern: TheSportsDB → ESPN → football-data.org → OpenLigaDB.

### Phase 3 — Tests (Datenverfügbarkeit garantieren)
- Cascade-Fallback, `useFootballData`-Lifecycle, ESPN-Provider, LeagueDashboard-States,
  ErrorBoundary.

### Phase 4 — UI/UX-Politur + visueller Redesign
- Design-System + Skills, verfeinerte Seiten, konsistente Badges, Motion, mobile-first,
  aufgewertete Skeleton/Empty/Error-Zustände.

### Phase 5 — Release-Readiness + Deploy
- Proxy deploybar (Doku + `VITE_LIVE_DATA_PROXY_URL` prod). CI grün. GitHub-Pages-Deploy.

## Verifikation

1. `npm run dev:all` → `localhost:5173` zeigt Standings ohne langes Laden.
2. Ohne football-data.org-Key: Daten via TheSportsDB/ESPN.
3. Proxy killen → App zeigt Fehler + Retry, **kein** White-Screen.
4. `npm test` grün, `npm run lint` sauber, `npm run build` grün.

## Arbeitsweise

Nach jedem abgeschlossenen Schritt Commit + Push auf `develop` mit klarer Message.
