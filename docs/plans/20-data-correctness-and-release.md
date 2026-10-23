# 20 — Richtige Daten, stabil, performant

Status: aktiv · Erstellt: 2026-10-23 · Nachfolger von Plan 19 (übernimmt dessen offene Phasen 7–10).


## Context
Plan 19 („Perfection Overhaul“) ist zu ~60 % umgesetzt: Phasen 0–6 sind committed (TanStack Query, ESPN-Schicht mit Zod, Design-System, Responsive, Performance 273→133 KB, A11y). Phase 7 (i18n) liegt **halb fertig und uncommitted** im Working Tree, die Phasen 8–10 (PHP-Proxy/Hostinger, SEO/PWA, Tests/Doku) fehlen ganz.

Die Analyse von Code und Doku ergab drei Problemblöcke:
1. **Der aktuelle Stand kompiliert nicht.** Galaxy rendert `{de,en}`-Objekte als React-Child, dann Crash. `WorldCupPages`/`BracketBoard` nutzen entfernte Props/Felder.
2. **Es gibt falsche oder irreführende Daten:**
   - WM-Elfmeterspiele: `score.fullTime` enthält bei football-data v4 die Elfmeter.
   - Die Form-Achse im Team-Radar ist immer 50.
   - Der Spieltag ist oft N+1.
   - Verschobene Spiele werden als „FT“ gezeigt.
   - Geschätzte Minuten erscheinen als echte Werte.
   - Unbekannte Nationalität bekommt die England-Flagge.
   - Wikidata kann ein falsches Foto liefern.
   - Perzentile gehen kaputt, wenn `appearances=0`.
   - Die Assist-Liste im football-data-Fallback ist falsch.
   - Die Zonen sind für alle Ligen gleich.
   - Das „Live“-Badge erscheint auch bei 24 h alten Cache-Daten.
   - Fehler werden still als „leer“ gezeigt.
3. **Effizienz und Hosting:**
   - Der Browser-Throttle erlaubt 100 statt 10 Requests/min.
   - Pro Liga laufen 40 ESPN-Schedule-Calls.
   - Der LCP liegt bei 6–13 s.
   - Es gibt keinen PHP-Proxy und kein `.htaccess`.
   - Der Node-Proxy hat CORS `*`, kein Timeout und noch API-Football-Reste.
   - Die Doku ist an vielen Stellen veraltet (README, memory.md, design-system, .env.example, kaputte Code-Fences in AGENTS.md/PLANS.md).

Ziel: Die App läuft fehlerfrei, zeigt **nachweislich korrekte Daten** und lädt schnell. Danach ist sie auf Hostinger deploybar. Bestehende Entscheidungen bleiben: live-only, WM = Archiv, TanStack Query, Hostinger + PHP.

**Arbeitsweise je Phase:**
- Schritte klein halten, Commit auf `develop`.
- Gate: `npm run lint && npx tsc -b && npm test && npm run build` grün.
- Danach Browser-Check (375/768/1440, hell und dunkel).
- Fortschritt in `docs/plans/20-data-correctness-and-release.md` eintragen. Diese Datei wird im ersten Schritt aus diesem Plan angelegt; `docs/plans/README.md` wird ergänzt.

---

## Phase 0 – Arbeitsstand reparieren & sichern (Blocker)
1. Galaxy-Typen: `GalaxyMapPage.tsx` rendert `LocalizedText` über einen Helper `localize(text, locale)` (in `features/galaxy-map/`). `context.tsx:54` `r.amount` wird per Union-Narrowing (`r.type === 'xp'`) gelesen.
2. WM-Seiten an die neuen Typen anpassen:
   - `WorldCupPages.tsx`: `WorldCupError` ohne `error`-Prop, `TeamScore` ohne `score`.
   - `data.round` → `stage` + `labels.ts`.
   - `BracketBoard.tsx:99,129`: `round.label` → Stage-Label aus `labels.ts`.
3. Leeres `quality({})` in `footballDataProvider.ts:480` entfernen. Der weggefallene „Kader noch nicht veröffentlicht“-Hinweis bekommt einen Empty-State.
4. `release.yml`: `npx tsc -b` vor dem Release ergänzen. Dann wird nie wieder ein Stand released, der nicht kompiliert.
5. Gate grün → Commit „feat(i18n): extract messages (phase 7A)“.

## Phase 1 – Datenkorrektheit (höchste Priorität)
Jeder Fix bekommt einen Test mit realem (anonymisiertem) Payload-Fixture in `src/test/fixtures/`.

**WM 2026 (football-data.org)**
1. Ergebnis bei Verlängerung/Elfmeter: Zuerst einen echten Payload eines K.-o.-Spiels mit Elfmeterschießen prüfen (über den Proxy).
   - `mapFixture` liest dann `regularTime` + `extraTime` als Spielstand.
   - `penalties` wird separat gespeichert.
   - Der Sieger kommt aus `score.winner`, die Art des Spielendes aus `score.duration`.
   - Die UI zeigt „n. V.“ bzw. „i. E. 4:3“.
   - `BracketBoard.tsx:14` ermittelt den Sieger über `winner`.
   - Das Label „Regular time“ in `components.tsx:1180` wird korrigiert.
2. Zod-Schemas für alle WM-Antworten (`services/worldCup/schemas.ts`) statt `getJson<T>`-Casts.
3. Gruppentabellen-Fallback (`footballDataProvider.ts:350`):
   - Mehrfache `TOTAL`-Blöcke deduplizieren.
   - Die Reihenfolge innerhalb der Gruppe aus den Gruppenspielen berechnen: Punkte, Tordifferenz, Tore, direkter Vergleich.
4. Archiv-Darstellung:
   - Bei beendeter Gruppenphase kein `best-third-watch` mehr.
   - Alter zum Turnierstart (`tournament.ts`) statt zu heute.
   - Stadt-Filter und Stadt-Labels entfernen, solange keine Venue-Daten da sind.

**Ligen (ESPN primär)**

5. Team-Radar „Form“: `TeamDetail.tsx` berechnet die Form via `formFromMatches` aus den Team-Spielen (wie `LeagueDashboard.tsx:98`). Ohne Spiele wird die Achse ausgeblendet statt 50 gesetzt.
6. Spieltag: `currentMatchdayFromTable` (`lib/season.ts:52`) richtet sich nach `min(playedGames)`/`max(playedGames)`. N+1 nur, wenn alle Teams N Spiele haben.
7. Live-Seite:
   - Verschobene oder abgesagte Spiele (`state post && !completed`) bekommen das Label „Verschoben“ und keinen Score (`liveScores.ts:166`), so wie `league.ts:157`.
   - Wenn alle Ligen fehlschlagen, gibt es einen Fehler statt `[]` (`liveScores.ts:300`).
8. Spielerdaten ehrlich:
   - Minuten: `estimated: true` und ein Label „≈ geschätzt“ in `PlayerDetail`/`StatBar`.
   - „Verfügbarkeit %“ entfernen.
   - Form-Score-Kommentar korrigieren.
   - `derivePlayerAttributes` löschen.
   - `nationalityFlag`-Fallback auf England durch „keine Flagge“ ersetzen.
   - Wikidata: kein `rows[0]`-Fallback, nur Treffer mit Fußball-Beschreibung.
9. Perzentile: Pool-Spieler mit `appearances=0` ausschließen. Bei zu kleinem Pool (unter 8) keine Perzentile anzeigen.
10. football-data-Fallback:
    - Assists aus `/scorers?limit=100`, nach Assists sortiert und mit Hinweis.
    - `POSTPONED`/`SUSPENDED`/`CANCELLED` als eigene Status statt `SCHEDULED`.
11. Tabellenzonen pro Liga in die Liga-Metadaten aufnehmen: UCL, UEL, UECL, Relegation-Playoff, Abstieg. Bundesliga und Ligue 1 bekommen den Relegationsplatz, Ligue 1 hat 18 Teams. Legende entsprechend anpassen.
12. Frische statt „Live“:
    - Das Badge nutzt `dataUpdatedAt` und den Proxy-Header (`x-cache: stale`).
    - Unter 5 min heißt es „Aktuell“, sonst „Stand hh:mm“, bei Stale-Fallback „Offline-Stand“.
    - Teilfehler (Scoreboard oder Statistik `catch → {}` in `league.ts:184`) werden als Teilausfall durchgereicht. Die betroffene Karte zeigt dann einen Fehlerhinweis statt leer zu bleiben.
13. **Daten-Invarianten als Tests** (`src/lib/dataInvariants.ts` + Test), auch in DEV im Mapper geloggt:
    - `pts = 3W + D`
    - `played = W + D + L`
    - `GD = GF − GA`
    - Summe der Siege gleich Summe der Niederlagen
    - Teamzahl 20 bzw. 18
    - Ränge 1…n eindeutig
14. **Manueller Daten-Abgleich:** `scripts/verify-live-data.mjs` holt die Tabellen aller 5 Ligen über ESPN **und** football-data. Es vergleicht Punkte, Spiele und Tordifferenz pro Team und meldet Abweichungen. Das Ergebnis kommt als QA-Bericht nach `docs/qa/data-verification-2026-10.md`.

## Phase 2 – API-Effizienz & Rate-Limits
1. football-data-Throttle in `liveClient.ts:62`: Token-Bucket 10/60 s statt 600 ms Abstand. Bei 429 `retry-after` respektieren (Proxy muss es weiterreichen), keine Sofort-Retries.
2. Coach/Stadion-Metadaten (`thesportsdb/teams.ts:100`) nur auf der Team-Seite laden, 24 h cachen. Das Dashboard und die Multi-Liga-Seiten (`football.ts:96`) brauchen sie nicht.
3. ESPN-Spielplan: Statt 2 Schedules × 20 Clubs **einen** Liga-Scoreboard-Call mit Saison-Datumsbereich (`?dates=YYYYMMDD-YYYYMMDD&limit=500`) holen. Vorher prüfen, ob ESPN das für alle 5 Ligen vollständig liefert. Fallback bleibt der Team-Schedule nur für die Team-Seite.
4. Query-Keys vereinheitlichen: `proxy-health`, `search` und `team matches` in `queryKeys.ts` aufnehmen. Default-`staleTime` pro Datentyp: Tabelle 5 min, Spielplan 15 min, Kader/Meta 24 h.

## Phase 3 – Proxy, Sicherheit & Hostinger (= Plan 19 Phase 8)
1. Eine Proxy-Spezifikation (`proxy/SPEC.md`) für beide Varianten:
   - Host- und Pfad-Allowlist.
   - TTL pro Route: Scoreboard 20 s, Tabelle 5 min, Teams/Kader 24 h, Bilder 7 Tage.
   - Stale-while-revalidate und Stale-on-error.
   - Timeout 10 s, Größenlimit, nur GET.
   - Origin-Allowlist, Rate-Limit pro IP.
   - `retry-after`/`x-cache` werden durchgereicht, Upstream-Fehlerdetails nicht.
2. `public/api/live.php` + `config.sample.php`. Der Key liegt außerhalb des Webroots, der Datei-Cache in `api/cache/` ist per `.htaccess` gesperrt.
3. Den Node-Proxy (`proxy/football-data-proxy.mjs`) an die Spezifikation angleichen. API-Football-Code und `API_FOOTBALL_KEY` entfernen, ebenso `SPORTSDB_API_KEY` (oder tatsächlich nutzen).
4. `public/.htaccess`: SPA-Fallback, `immutable` für `/assets/*`, `no-cache` für `index.html`, Kompression, Security-Header inkl. CSP mit den Bild-CDNs.
5. Release: zusätzlicher Build mit `VITE_BASE=/` und `VITE_LIVE_DATA_PROXY_URL=/api/live.php` als ZIP-Artefakt. Optional FTP-Deploy über GitHub-Secrets.
6. Proxy-Integrationstest (Node gegen `php -S`): fremde Origin → 403, Rate-Limit → 429, Cache-Hit, Stale-on-error.

## Phase 4 – Performance (LCP < 2,5 s)
1. Der Proxy-Cache (Phase 3) liefert die Tabelle warm aus. Das Dashboard rendert sofort aus dem persistierten Query-Cache, mit Frische-Badge aus Phase 1.12.
2. `<link rel="preconnect">` zu Proxy und `a.espncdn.com`. Wappen der Top-Zeilen bekommen `priority`.
3. Recharts-Chunk (365 KB) nur auf Seiten mit Charts laden. Prüfen, dass `chartTheme` keine Charts in den Dashboard-Pfad zieht.
4. Lighthouse mobil vorher/nachher für Dashboard, Team, Spieler und WM. Ziel: Performance ≥ 90, sonst unverändert 100/≥ 96.

## Phase 5 – i18n fertigstellen (= Plan 19 Phase 7B–D)
1. `WorldCupPages.tsx`, `GalaxyMapPage.tsx`, `BracketBoard.tsx`, `world-cup/charts.tsx`, `Settings.tsx:87`, `ErrorBoundary` (`app.tsx:10`) und `HandbookDialog` vollständig über `t()`. Der „Mock data“-Badge und der Text zum lokalen Fallback werden entfernt.
2. Tote i18n-Keys entfernen. Dazu ein Vitest, der unbenutzte Keys meldet (dynamische Präfixe auf einer Allowlist).
3. `LocaleContext.tsx:34,42`: `localStorage` in try/catch.
4. Galaxy-„Demo XP“-Buttons nur in `import.meta.env.DEV`.

## Phase 6 – SEO, PWA & Routen-Tabelle (= Plan 19 Phase 9)
1. Deklarative Routen-Tabelle in `navigation.ts`/`router.tsx`. Sie ersetzt die If-Kette `getLayoutTitle` (`router.tsx:78`) und liefert `document.title` + Meta-Description (`useDocumentMeta`).
2. `index.html`: description, theme-color, OG/Twitter, apple-touch-icon, `<noscript>`.
3. `manifest.webmanifest` + Icons aus `assets/`, `robots.txt`, `sitemap.xml` (im Build generiert).

## Phase 7 – Code-Gesundheit & Tests (= Plan 19 Phase 10A–C)
1. `features/world-cup/components.tsx` (1266 Z.) in Einzeldateien aufteilen. Ein `WorldCupQueryBoundary` ersetzt die 7× wiederholten Error-Checks.
2. Tote Dateien löschen: `components/ui/tooltip.tsx`, `data/playerPhotoSources.ts`. Die doppelte football-data-Schicht (`footballData.ts` vs `footballDataOrg.ts`) klären.
3. Neue Tests:
   - Galaxy-Reducer
   - WM-Seiten (Elfmeter, Gruppen, Archiv)
   - Team-/Spieler-Detail (Fehler, Not-Found, geschätzte Minuten)
   - Query-Client/Persister
   - i18n-Parität
   - Coverage-Schwelle schrittweise auf 60 % (services/hooks ≥ 70 %)
4. Playwright-Smoke (375 + 1440): Dashboard, Team, Spieler, Live, WM-Bracket, 404.

## Phase 8 – Doku & Abschluss
1. README: echte Quellen-Kaskade (ESPN → football-data → OpenLigaDB, TheSportsDB nur Meta), Node 22, Hostinger-Deploy, aktuelle Struktur.
2. Code-Fences reparieren: `AGENTS.md` (abgeschnitten) und `PLANS.md`.
3. `docs/memory.md` mit Plan 17–20 aktualisieren. Veraltete Aussagen streichen: Snapshot, Mock-Explorer, date-fns, `theSportsDb.ts`.
4. Überholte Inhalte bereinigen:
   - `docs/design-system.md` (§5, §9, §10).
   - `.env.example` (kein API-Football/Snapshot, PHP-Proxy-URL).
   - Kommentare in `tournament.ts:5` und `footballDataOrg.ts:11`.
   - Plan 13/14/16/18 als „superseded“ markieren.
5. `docs/deploy-hostinger.md` neu anlegen. Die Memory-Datei `world-cup-live-only.md` aktualisieren.
6. Abschluss: `/code-review high`, Lighthouse- und Bundle-Bericht vorher/nachher, QA-Bericht zum Daten-Abgleich.

---

## Kritische Dateien
- `src/services/worldCup/footballDataProvider.ts`, `src/features/world-cup/{components.tsx,BracketBoard.tsx,labels.ts}`, `src/pages/world-cup/WorldCupPages.tsx`
- `src/services/espn/{league.ts,liveScores.ts,players.ts}`, `src/services/wikidata.ts`, `src/services/footballDataOrg.ts`, `src/services/thesportsdb/teams.ts`
- `src/services/net/liveClient.ts`, `src/hooks/queries/*`, `src/services/queryKeys.ts`, `src/app/queryClient.ts`
- `src/lib/{season.ts,percentiles.ts,player-ratings.ts}`, `src/pages/{TeamDetail,PlayerDetail,LeagueDashboard}.tsx`, `src/components/league/LeagueTable.tsx`
- `src/features/galaxy-map/{GalaxyMapPage.tsx,context.tsx,types.ts}`
- `proxy/football-data-proxy.mjs`, neu `public/api/live.php`, `public/.htaccess`, `.github/workflows/release.yml`

Wiederverwenden:
- `formFromMatches` (`espn/league.ts:289`)
- `createPromiseCache`
- `fetchLiveJson`/`LiveHttpError` (`liveClient.ts`)
- `isLeagueId`
- `ErrorState`/`NotFoundState`/`EmptyState`
- `labels.ts` (WM-Labels)
- `countries.ts`/`positions.ts`
- `chartTheme.ts`

## Verifikation
1. Pro Phase: `npm run lint && npx tsc -b && npm test -- --coverage && npm run build` grün.
2. `npm run dev:all`, im Browser-Pane prüfen:
   - Breiten 375/768/1440, hell und dunkel.
   - Alle 5 Ligen, Team, Spieler, Live, Vergleich, WM (Übersicht, Gruppen, Bracket mit Elfmeterspielen, Match-Detail), Galaxy, 404.
   - Konsole fehlerfrei.
3. Datenkorrektheit:
   - `node scripts/verify-live-data.mjs`: 0 Abweichungen bei Punkten und Tordifferenz, oder dokumentierte Erklärung.
   - Stichprobe von 3 Teams je Liga gegen die offizielle Ligaseite.
   - WM-Finale und Elfmeterspiele gegen bekannte Ergebnisse prüfen.
4. Netzwerk: ein Dashboard-Load ≤ ~6 Upstream-Calls; football-data nie über 10/min (Proxy-Log).
5. Ab Phase 3: `php -S` + Integrationstest; `.htaccess`-Header per `curl -I`.
6. Lighthouse mobil vorher/nachher dokumentieren.

---

## Fortschritt

### Phase 0 – erledigt (2026-10-23)
- i18n-Extraktion (Plan 19, 7A) gesichert: `src/i18n/{de,en}.ts` (typsicher), `labels.ts`, `countries.ts`, `positions.ts`.
- Build wieder grün: Galaxy rendert `LocalizedText` über `localize()` und ist komplett übersetzt; Demo-XP-Buttons nur noch in DEV.
- WM-Seiten (`WorldCupPages.tsx`, `BracketBoard.tsx`) an die neuen Typen angepasst und über `t()`/`useWorldCupLabels` übersetzt. Falscher Hinweis „Live data refreshes every 15 seconds“ entfernt. Timeline, Statistiken und Aufstellungen erscheinen nur mit Daten, sonst ein ehrlicher Hinweis.
- `useTournamentPhase` ist jetzt rein (`Date.now()` einmal pro Mount, Lint-Regel `react-hooks/purity`).
- React-18-Warnung zu `fetchPriority` behoben (`src/lib/fetchPriority.ts`).
- `release.yml` prüft jetzt `tsc -b` vor dem Release.
- Gate: Lint, `tsc -b`, 57/57 Tests, Build grün. Browser: Galaxy (DE, Dialog), WM-Bracket/Teams (DE, EN mobil 375 px, kein Überlauf), Premier League Dashboard.

**Bestätigt für Phase 1.1:** Das Bracket zeigt „Deutschland 4 : Paraguay 5“ und „Australien 3 : Ägypten 5“. `fullTime` enthält also offenbar die Elfmeter.

### Phase 1 – erledigt (2026-10-23)
**WM 2026**
- **1** Elfmeter: `score.fullTime` enthält bei football-data v4 das Elfmeterschießen (Deutschland – Paraguay kam als 4:5). Spielstand = fullTime − penalties; `winner`, `decidedBy`, `penalties` separat. UI: „n. V.“, „i. E. 3:4“, Sieger im Turnierbaum hervorgehoben, Detailseite „Paraguay gewinnt 4:3 im Elfmeterschießen“. Tests mit echten Payloads (`src/test/payloads/worldCupKnockout.ts`).
- **2** Zod-Schemas für alle WM-Antworten (`services/worldCup/schemas.ts`).
- **3** Gruppentabellen aus dem Archiv: ein Eintrag pro Team auch bei mehreren TOTAL-Blöcken, FIFA-Reihenfolge mit direktem Vergleich (`groupRanking.ts`).
- **4** Nach Auslosung des Sechzehntelfinales: „bester Dritter“ bzw. „ausgeschieden“ statt „Beobachtung“; Alter zum Eröffnungstag; Stadt-Filter entfernt (keine Venue-Daten).

**Ligen**
- **5** Formachse im Team-Radar aus den Ligaergebnissen aller Klubs (`withRecentForm`), ohne Daten ausgeblendet.
- **6** Spieltag bleibt N, solange Runde N läuft; Nachholspiele zählen nicht.
- **7** Live: verschobene Spiele „Verlegt“ ohne Ergebnis; Totalausfall = Fehler statt leerer Spieltag. Neuer Match-Status `POSTPONED` (ESPN + football-data).
- **8** Keine geschätzten Minuten, keine erfundene „Verfügbarkeit“, keine abgeleiteten Attribute mehr: Startelf/Einwechslungen (echt), Werte pro Einsatz, Form-Score mit Startelf-Quote. Unbekannte Nationalität ohne Flagge; Wikidata-Foto nur für Fußballer.
- **9** Perzentile ohne Spieler ohne Einsätze, erst ab 8 vergleichbaren Spielern.
- **10** football-data-Fallback: Assists aus den Top-100-Torschützen; verlegte/abgesagte Spiele eigener Status.
- **11** Tabellenzonen je Liga (`lib/tableZones.ts`): CL-Plätze (Ligue 1: 3 + Qualifikation), Relegation (Bundesliga/Ligue 1), Abstieg; Legende zeigt nur vorhandene Zonen.
- **12** Frische-Badge „Aktuell“ nur < 5 min, sonst „Stand <Zeit>“. Teilausfälle von Scoreboard/Statistik werden gemeldet („Bestenliste nicht verfügbar“). *Offen:* Proxy-Stale-Header bis in die UI → Phase 3.
- **13** Tabellen-Invarianten (`lib/dataInvariants.ts`) als Test und DEV-Warnung.
- **14** `npm run verify:data`: ESPN und football-data.org in allen 5 Ligen identisch (96/96 Klubs) → `docs/qa/data-verification-2026-10.md`.

Gate: Lint, `tsc -b`, Tests, Build grün. Browser: WM (Turnierbaum, Spiele, Gruppen, Detail), Bundesliga-Dashboard und -Teamseite, Premier-League-Spielerseite.

**Notiert für spätere Phasen:** englisches Länder-Badge im Liga-Kopf („Germany“), Live-Statuslabels („FT“) und Formlabels („Top Form“) noch englisch → Phase 5.

### Phase 2 – erledigt (2026-10-23)
- **1** `liveClient`: football-data.org als gleitendes Fenster mit 10 Starts pro 60 s (vorher 600 ms Abstand = 100/min). Ein 429 wird nur wiederholt, wenn `Retry-After`/`X-RequestCounter-Reset` ≤ 8 s meldet, sonst bricht die Anfrage sofort ab. Der Node-Proxy setzt `access-control-expose-headers`, damit der Browser die Header lesen kann.
- **2** Trainer/Stadion (TheSportsDB + football-data.org) nicht mehr im Liga-Kern, nur noch über `getTeam` auf Team-/Trainerseiten. Dashboard, Explorer und Vergleich rufen football-data.org gar nicht mehr auf.
- **3** Saisonspiele: ESPN-Liga-Scoreboard pro Saisonmonat (`dates=YYYYMM`, 12 Aufrufe, jedes Spiel einmal) statt 2 Spielplänen × 20 Klubs (40 Aufrufe, jedes Spiel doppelt). Vollständigkeit geprüft: 380/306 Spiele je Liga, beendete Spiele = Summe Spiele/2 der Tabellen. Ein fehlender Monat lässt die Abfrage scheitern statt eine lückenhafte Form zu zeigen. Team-Spiele sind ein `select` auf diese Abfrage (kein eigener Request).
- **4** Query-Keys zentral (`search`, `proxyHealth`), `staleTimes` je Datentyp (Tabelle 5 min, Spielplan 15 min, Kader/Spieler 30 min, Klub-Metadaten 6 h).

**Messung (frischer Cache, Premier League):** Dashboard 16 Datenanfragen + Health-Check (vorher ≈ 46, davon 3 an football-data.org); Team-Seite danach 3 (Metadaten ×2, Kader), Spiele aus dem Cache.

Gate: Lint, `tsc -b`, 79 Tests, Build grün.
