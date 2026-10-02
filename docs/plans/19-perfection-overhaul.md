# 19 — Perfection Overhaul (Phasenplan)

Status: aktiv · Erstellt: 2026-10-02 · Ersetzt die offenen Punkte aus Plan 18.

## Context
Komplette Analyse (Architektur, UI/Responsiveness, Code-Qualität/Performance) ergab: Die App funktioniert, hat aber
echte Bugs (StaggerGrid remountet Seiten, falsche Saison 2025-26, Endlos-Spinner, falscher Spieler bei Lookup-Fehler),
stille Design-Fehler (Tailwind v3 erzeugt kein CSS für `/8`, `/12`, `/96` …), ein offenes Proxy-Relay mit API-Keys,
~430 KB Mock-Daten im First-Load, zwei Chart-Libs, ~40 tote Dateien, kaputtes Mobile-Layout (Galaxy, WM-Bracket),
schwachen Light-Mode-Kontrast, halbe Übersetzungen und keine Hostinger-Deploy-Basis.

Entscheidungen des Users:
- **TanStack Query** einführen, alle eigenen Cache-Hooks darauf migrieren.
- **Alles live**: Mock nur noch für Tests/Dev, keine erfundenen Daten in der UI.
- **WM 2026 = Archiv-Modus**: football-data.org, einmal laden + lange cachen, kein Polling.
  → Memory `world-cup-live-only.md` danach aktualisieren (ist veraltet).
- **Hosting: Hostinger** Shared Hosting, statisches Frontend + `.htaccess` + **PHP-Proxy**.

Arbeitsweise je Phase: Plan-Datei `docs/plans/19-…` pflegen → kleine Commits auf `develop` →
`npm run lint && npx tsc -b && npm test && npm run build` grün → Review → nächste Phase.
Jede Phase ist eigenständig auslieferbar.

---

## Phase 0 – Fundament & Aufräumen (Basis für alles)
- A. Plan `docs/plans/19-perfection-overhaul.md` anlegen; `docs/plans/README.md` um 17–19 ergänzen; `PLANS.md` korrigieren.
- B. Toten Code löschen: `src/pages/dashboard/`, `src/app/{app-shell,query-client}.ts(x)`, `src/features/standings/`,
  `src/services/{index.ts,api/,queries/,mappers/,schemas/,config/}`, `src/shared/{ui,i18n,config,lib,types}`,
  `src/shared/styles/globals.css`, `src/services/openFootball.ts` + `src/data/historical/`, `apiFootballProvider.ts` (+Test),
  `hooks/usePullToRefresh.ts`, `components/shared/{CardGrid,StatCard}.tsx`, ungenutzte `components/ui/{card,dropdown-menu,popover,sheet}.tsx`
  (sheet ggf. behalten für Phase 4 Galaxy/Mobile-Menü), `features/galaxy-map/levels.ts`, `src/App.tsx`.
- C. `tsconfig.app.json`: Whitelist → `"include": ["src"]`; alle Typfehler beheben.
- D. `vite.config.ts`: Test-Excludes für `src/app/**`, `src/features/**` entfernen; `@vitest/coverage-v8` + Schwellwert.
- E. ESLint: `proxy/` & `scripts/` mitlinten, type-aware Regeln (`no-floating-promises`, `no-misused-promises`).
- F. Repo-Ballast: `build.log`, `test.log` löschen; `squads-snapshot.json`/`standings-snapshot.json` nach `scripts/data/` oder gitignore;
  große PNGs in `assets/` & `docs/concepts/` prüfen (behalten nur Nötiges, komprimiert).
- G. CI: neuer Workflow `ci.yml` für PRs (lint, tsc, test+coverage, build, `npm audit --omit=dev`); Node 22.
- H. UTF-8-BOMs entfernen (`TeamsExplorer.tsx`, `PlayerDetail.tsx`); `leagueId as never` → `isLeagueId`-Guard.

## Phase 1 – Kritische Bugs
- A. `StaggerGrid.tsx`: `motion.create(as)` aus dem Render raus (Map auf Modulebene) → behebt Remounts & Fokusverlust in Suche.
- B. Saison: `DEFAULT_SEASON` in `DataSourceContext.tsx` durch `estimateCurrentSeasonLabel()` ersetzen; alle Quellen (football-data, OpenLigaDB, ESPN) nutzen dieselbe Funktion.
- C. `MatchdaySwiper`: kein doppelter Load mehr; Matchday-Anzahl pro Liga (34 vs 38); Matchday tatsächlich an Daten weiterreichen oder Feature korrekt umsetzen.
- D. `theSportsDb.ts`: Promise-Cache ohne TTL entfernen (übernimmt TanStack Query in Phase 2).
- E. Detail-Seiten (`TeamDetail`, `PlayerDetail`, `CoachDetail`): `error` + Not-Found-State statt Endlos-Spinner; `PlayerDetail` `getTeam` erst mit gültiger `teamId`.
- F. Keine Fake-Fallbacks: `getPlayer`/`getTeam` liefern `null` statt Mock/`teams[0]`; erfundene Charts (`TeamDetail.tsx:101`), synthetische Squads, Fake-Manager/Stadion entfernen bzw. Sektion ausblenden.
- G. Toast: Timer clearen, `role="status"`/`aria-live`, Varianten (error/info/success).
- H. Catch-all 404-Route + Lazy-Chunk-Ladefehler (nach Deploy) → automatischer Reload einmalig.

## Phase 2 – Datenschicht neu (TanStack Query, alles live)
- A. `@tanstack/react-query` (+ devtools nur dev) installieren; `QueryClient` in `src/app/providers.tsx` mit Defaults
  (staleTime 15 min, gcTime 1 h, retry über `liveClient`, `refetchOnWindowFocus` gezielt).
- B. Persistenz: `@tanstack/query-sync-storage-persister` statt `services/cache/persistentCache.ts` (oder dieses als Persister-Adapter weiterverwenden).
- C. Query-Key-Factory `src/services/queryKeys.ts`; Hooks: `useLeagueSummary`, `useStandings`, `useTeam`, `usePlayer`, `useCoach`, `useLiveScores`, `useWorldCup*`.
- D. `useFootballData.ts`, `useWorldCupData.ts` ersetzen; `useLiveScores` auf `refetchInterval` (30 s live / 90 s sonst, pausiert hidden) portieren.
- E. `liveClient.ts`: Request-Timeout (AbortController, ~10 s), Abort nicht retryen, Throttle-Wait außerhalb des Slots, Dedupe-Key inkl. Header.
- F. WM-Provider (`footballDataProvider.ts`) über `fetchLiveJson` → Throttle/Retry/Dedupe; WM-Archiv: `staleTime: Infinity`, kein Polling.
- G. Zod-Schemas für football-data.org und TheSportsDB-Antworten (aktuell nur Cast).
- H. Ein gemeinsamer `cascade`-Helper (Duplikat in `worldCup.ts` entfernen); Quellen-Kaskade parallelisieren wo sinnvoll (Timeout-Race statt sequenziell).
- I. `theSportsDb.ts` (960 Zeilen) aufteilen: `espn/standings`, `espn/rosters`, `wikidata/images`, `mappers/`; umbenennen, da es primär ESPN ist.
- J. `getPlayer` ohne sequenzielles Durchsuchen aller 20 Kader: Spieler→Team-Index aus bereits geladenem Summary.
- K. Live-IDs überall: Explorer (`lib/explorer-data.ts`), Suche (`searchIndex`), Compare, Favoriten auf Live-Daten; Favoriten speichern Name+Logo mit (keine Mock-Auflösung).
- L. `data/mock` nur noch in Tests/Dev-Modus importieren → verschwindet aus dem Prod-Bundle.
- M. `useProxyHealth`: Polling stoppen sobald OK (Backoff bei Fehler), Health-URL relativ zur Proxy-Basis.
- N. Fehler-Toasts dedupliziert (einmal pro Query-Key, nicht pro Hook-Instanz).

## Phase 3 – Design-System & Grafik
- A. Tailwind-Opacity-Bug: `theme.extend.opacity` um 3,6,8,12,15,18,96 erweitern (oder Klassen normalisieren) – Build-CSS prüfen.
- B. Ein Token-Set: Motion-Tokens (CSS, `shared/motion/tokens.ts`, Tailwind) vereinheitlichen; Tailwind-Durations auf CSS-Variablen.
- C. Layout-Tokens tatsächlich nutzen: `--fg-sidebar-width`, `--fg-header-height`, `--fg-tabbar-height`, `--fg-content-max`, z-Index-Skala → alle Sticky-Offsets (Header, MatchdaySwiper, WM-Section-Nav) aus einem Token.
- D. Radius-Skala bereinigen (eine Benennung), arbitrary Werte entfernen.
- E. Typo-Skala: `text-[9/10/11px]` → `text-2xs`/`text-xs` (min. 11–12px auf Mobile), Typo-Tokens in Tailwind; Inter 900 laden oder `font-black` ersetzen; `font-mono`-Stack definieren; `tnum` nur auf Zahlen.
- F. Hex-Farben → semantische Tokens (`--fg-zone-cl`, `--fg-zone-rel`, `--fg-win/draw/loss`, Chart-Palette).
- G. Light-Mode: alle `text-*-100/200` & `bg-white/5`-Flächen mit Light-Varianten; Kontrast ≥ 4.5:1 prüfen (DataSourceBadge, FormBadge, Sidebar, MobileTabBar, LiveTicker, WM-Badges).
- H. Liga-/Teamfarben nie als Text auf dunklem Grund: `readableOn(color)`-Helper (Kontrast-Berechnung) für Text & Hero-Gradients.
- I. Kein Theme-Flash: Inline-Script in `index.html` setzt `dark`-Klasse vor dem ersten Paint.
- J. Eine Chart-Lib: **ECharts entfernen**, WM-Charts (`features/world-cup/charts.tsx`) auf Recharts; Recharts-Theme (Achsen, Tooltip, Farben aus Tokens, dark/light); zwei RadarCharts zu einer Komponente.
- K. Einheitliche Primitives: ein `BackButton` (44px Touch-Target), `PageWrapper` überall (Settings, CoachDetail), gemeinsame `ErrorState`, `NotFoundState`, layoutgetreue Skeletons.
- L. Logos: Liga-PNGs → SVG/WebP (klein), konsistente Fallbacks, Flaggen über `AssetImage`.
- M. Visueller Feinschliff: Hero-Bereiche, Karten-Hierarchie, Hover/Pressed-States, Leerräume – Abgleich mit `docs/design-system.md` (aktualisieren).

## Phase 4 – Responsiveness (Handy, Tablet, Desktop)
Zielbreiten testen: 360, 390, 768, 1024, 1280, 1440, 1920 + Landscape-Phone.
- A. Mobile-Menü auf Radix Dialog/Sheet: Focus-Trap, Escape, Scroll-Lock, `max-h`+Scroll, aktiver Zustand, Galaxy-Link.
- B. MobileTabBar: max. 5 Ziele (Ligen in einen Liga-Switcher bündeln), Labels ≥ 11px, übersetzt, kontraststarker Active-State, Safe-Area.
- C. Header Mobile: Icon-Buttons reduzieren (Overflow-Menü), Sprachumschalter erreichbar, `Ctrl/⌘ K` je OS, Safe-Area oben, nur ein `<h1>` pro Seite.
- D. Sidebar: eigener Scrollbereich, `focus-visible` für Remove-Buttons, Breite aus Token.
- E. `LeagueTable`: nur eine Variante rendern (`useMediaQuery`) statt beide per CSS; md/lg: Spalten ausblenden + sticky Pos/Team-Spalte; Mobile-Karten mit Zonen-Akzent & Favorit; keine verschachtelten Buttons; Zeilen als echte `<Link>`s; ohne `layout`-Animation.
- F. `SquadTable`: Keyboard, `aria-sort`, Label, valides HTML, übersetzt.
- G. Galaxy-Map: unter `md` gestapelt, Detailpanel als Bottom-Sheet, kein doppeltes Padding, in Navigation verlinkt.
- H. WM-Bracket: Mobile = Runden-Tabs/Swipe pro Runde, Desktop = 5-Spalten-Grid; Gruppen-Tabelle mit `scope` + nicht nur Farbe.
- I. Dialoge (Handbook, CommandPalette): `max-h-[90dvh]`, Scroll, Fullscreen auf Mobile; Close-Button 44px.
- J. `CompareButton` mobil nicht über Inhalt (über TabBar positionieren / in Seitenaktionen).
- K. `dvh` statt `vh`, Touch-Targets ≥ 44px überall, Hover-only-Interaktionen auch per Tap.

## Phase 5 – Performance
- A. First-Load: `CommandPalette` + Suchindex lazy (beim ersten Öffnen/⌘K), `HandbookDialog` lazy, `GalaxyProvider` nur auf `/galaxy`.
- B. Framer Motion: `LazyMotion` + `domAnimation` (`m.` statt `motion.`), Seiten-Transition auf eine Ebene, kein `AnimatePresence mode="wait"`-Blockieren.
- C. `manualChunks` neu ausrichten (ohne echarts/mock), `chunkSizeWarningLimit` zurück auf Default; Bundle-Analyse (`rollup-plugin-visualizer`) als Script; Budget: Initial-JS < 200 KB gzip.
- D. Fonts: nur `latin` (+ `latin-ext` falls nötig), woff2 only, Variable Font, Preload der Hauptdatei.
- E. Bilder: Hero/Crest/Spielerfoto `loading="eager"` + `fetchpriority="high"`; sonst lazy + `decoding="async"`, `width/height` gegen CLS; kein Opacity-Fade-in für LCP-Bilder; kein `src=""`.
- F. Render-Perf: `AssetImage` stabile `fallbackSrc` (Memo/Konstanten), `LeagueTable`-Callbacks stabil, `WorldCupMatchCard` memo, `useKeyboardShortcut` stabil, Suche mit `useDeferredValue`.
- G. Route-Prefetch bei Hover/Focus auf Nav-Links (Chunk + Query `prefetchQuery`).
- H. Messung: Lighthouse mobil (Ziel ≥ 95 Perf/A11y/BP/SEO), Web-Vitals (LCP < 2.5 s, CLS < 0.05, INP < 200 ms) vorher/nachher dokumentieren.

## Phase 6 – Accessibility & Motion
- A. `MotionConfig reducedMotion="user"` global; Recharts-Animation bei reduced motion aus.
- B. Skip-Link, Fokus nach Navigation auf `<main>`/`<h1>`, sichtbare Fokusringe (alle `outline-none` ersetzen).
- C. Toggle-Chips `aria-pressed`, Nav `aria-current`, ThemePicker mit Pfeiltasten, Compare-Suche als Combobox (cmdk/Radix).
- D. FormDots: fokussierbar, Buchstabe S/U/N bzw. W/D/L zusätzlich zur Farbe, ein TooltipProvider.
- E. Loading/Error: `role="status"`, `aria-busy`, `role="alert"`; Live-Score-Updates höflich ansagen.
- F. `EmptyState`-Heading-Level konfigurierbar; korrekte Heading-Hierarchie pro Seite.
- G. axe-Checks in Tests (`vitest-axe`) für Hauptseiten.

## Phase 7 – i18n (DE/EN vollständig)
- A. Übersetzungen aus `LocaleContext.tsx` in `src/i18n/{de,en}.ts` auslagern, typsicher (Keys aus `de` abgeleitet), fehlende Keys = TS-Fehler.
- B. Alle hart codierten Texte übersetzen: WM-Seiten, Galaxy, SquadTable, Charts, ErrorBoundary, Skeletons, Sidebar, TabBar, Settings, CommandPalette, Router-Titel.
- C. `date-fns`-Locale, `Intl.NumberFormat`/relative Zeit je Sprache, Ländernamen per `Intl.DisplayNames`.
- D. `<html lang>` initial per Inline-Script korrekt; Handbook-Text aktualisieren (kein „lokaler Fallback“ mehr).

## Phase 8 – Proxy, Sicherheit & Hostinger-Deploy
- A. PHP-Proxy `public/api/live.php` (oder `deploy/hostinger/api/`): gleiche Host-Allowlist + Pfad-Regeln, Key-Injection aus Umgebung/`config.php` außerhalb des Webroots, Datei-Cache mit TTL pro Host, Stale-on-error, Timeout, Größenlimit, keine Upstream-Fehlerdetails nach außen.
- B. Absicherung: CORS nur eigene Origin(s), Origin/Referer-Check, einfaches Rate-Limit pro IP (Datei/APCu), nur GET.
- C. Node-Proxy für lokale Entwicklung angleichen (gleiche Regeln, Origin-Allowlist, Timeout, In-Flight-Dedupe) – oder lokal ebenfalls PHP (`php -S`); eine Spezifikation für beide.
- D. `public/.htaccess`: SPA-Fallback, `Cache-Control: immutable` für `/assets/*`, `no-cache` für `index.html`, gzip/brotli, Security-Header (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- E. CI-Release: zusätzlicher Build mit `VITE_BASE=/` für Hostinger + Artefakt (ZIP) bzw. FTP/SSH-Deploy-Job (Secrets in GitHub, nie im Repo); GitHub Pages optional behalten.
- F. Env aufräumen: `SPORTSDB_API_KEY` entfernen oder tatsächlich nutzen, `API_FOOTBALL_KEY` entfernen (ungenutzt), `.env.example` + Hostinger-Config-Beispiel.
- G. Tests für den Proxy (PHPUnit-light oder Node-Integrationstest gegen `php -S`).

## Phase 9 – SEO, PWA & Meta
- A. `index.html`: description, `theme-color` (light/dark), OG/Twitter, `apple-touch-icon`, `<noscript>`.
- B. Per-Route `document.title` + Meta-Description (kleiner `useDocumentMeta`-Hook aus der Route-Tabelle).
- C. `manifest.webmanifest` + Icons (192/512/maskable); optional Service Worker (`vite-plugin-pwa`) für Offline-Shell + Asset-Cache.
- D. `robots.txt`, `sitemap.xml` (Ligen, WM-Seiten) im Build generiert.
- E. `router.tsx` refactoren: deklarative Route-Tabelle (Titel, Icon, Nav-Gruppe) → speist Sidebar, MobileTabBar, Mobile-Menü, Titel, Sitemap (beseitigt Duplikate + `getLayoutTitle`-If-Kette).

## Phase 10 – Tests, Doku & Abschluss
- A. Tests ergänzen: Query-Hooks, ESPN/football-data-Mapper (Fixtures), WM-Archiv-Provider, Router/404, LeagueTable (mobil/desktop), Detail-Fehlerzustände; Coverage-Ziel ≥ 70 % für `services/` & `hooks/`.
- B. Optional Playwright-Smoke (Mobile + Desktop Viewport, Screenshot-Vergleich der Hauptseiten).
- C. `features/world-cup/components.tsx` (1271 Z.) in Einzeldateien; `WorldCupPages.tsx` aufteilen.
- D. README, `AGENTS.md` (Stack stimmt dann), `.env.example`, `docs/design-system.md`, `docs/memory.md`, Deploy-Guide `docs/deploy-hostinger.md` aktualisieren.
- E. Memory `world-cup-live-only.md` → „WM = Archiv-Modus, football-data.org, kein Polling“.
- F. Abschluss-Review (`/code-review high`) + Lighthouse-/Bundle-Bericht vorher/nachher.

---

## Wichtige Dateien (Auswahl)
`src/app/router.tsx`, `src/app/providers.tsx`, `src/contexts/{DataSourceContext,LocaleContext}.tsx`,
`src/hooks/{useFootballData,useWorldCupData,useLiveScores,useProxyHealth}.ts`, `src/services/{footballData,theSportsDb,footballDataOrg,openLigaDb}.ts`,
`src/services/net/liveClient.ts`, `src/services/worldCup/*`, `src/components/shared/{StaggerGrid,AssetImage}.tsx`,
`src/components/league/LeagueTable.tsx`, `src/components/layout/{Sidebar,Header,MobileTabBar,MatchdaySwiper,CommandPalette}.tsx`,
`src/features/world-cup/components.tsx`, `src/features/galaxy-map/GalaxyMapPage.tsx`, `src/shared/styles/tokens.css`, `src/index.css`,
`tailwind.config.ts`, `vite.config.ts`, `tsconfig.app.json`, `index.html`, `proxy/football-data-proxy.mjs`, `.github/workflows/release.yml`.

## Verifikation (pro Phase)
1. `npm run lint && npx tsc -b && npm test -- --coverage && npm run build` grün.
2. App via `npm run dev:all` im Browser-Pane prüfen: Mobile (375×812), Tablet (768), Desktop (1440), jeweils Light + Dark.
3. Bundle: `dist/index.html` darf keine Mock-/Chart-Chunks preloaden; Größen vor/nach notieren.
4. Lighthouse mobil auf Liga-Dashboard, Team-, Spieler-, WM-Seite.
5. Ab Phase 8: Proxy lokal mit `php -S` testen (fremde Origin → 403, Rate-Limit → 429, Cache-Hit), `.htaccess`-Header prüfen.

---

## Fortschritt

### Phase 0 – erledigt (2026-10-02)
- ~45 tote Dateien entfernt (alter Standings-Stack, react-query-Reste, `openFootball`, `apiFootballProvider`, ungenutzte UI-Primitives, `globals.css`).
- `tsconfig.app.json` prüft jetzt ganz `src`; ausgeschlossene Tests wieder aktiv; WM-Filtertest auf football-data.org-Mapper umgestellt.
- Coverage (`npm run test:coverage`, v8) mit Baseline-Schwelle; ESLint mit type-aware Promise-Regeln, lintet `proxy/` und `scripts/`.
- Neuer PR-Workflow `.github/workflows/ci.yml` (Node 22); Snapshot-JSONs nach `scripts/data/`; BOMs entfernt.
- Verschoben: `leagueId as never` → wird mit den neuen Query-Hooks in Phase 2 sauber typisiert (Not-Found in Phase 1E).
- Logo-Originale in `assets/` bleiben als Quellmaterial (App-Icons in Phase 9).

**Baseline vor Optimierung:** Coverage 25,6 % Lines · Bundle: `vendor` 491 KB (157 KB gz), `echarts` 833 KB (247 KB gz), `motion` 110 KB, `index` 133 KB, 5 Mock-Chunks à ~85 KB werden beim Start vorgeladen.
