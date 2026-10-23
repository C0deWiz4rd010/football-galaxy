# Datenprüfung Oktober 2026 (Plan 20, Phase 1)

Stand: 2026-10-23 · Saison 2026/27 · WM 2026 (Archiv)

## 1. Ligatabellen: ESPN gegen football-data.org

`npm run verify:data` (Proxy muss laufen: `npm run proxy:dev`) liest die Tabellen beider Quellen,
prüft die Rechenregeln jeder Tabelle und vergleicht Klub für Klub Spiele, Punkte, Tore, Tordifferenz und Platz.

| Liga | Zugeordnet | ESPN-Arithmetik | football-data-Arithmetik | Abweichungen |
|---|---|---|---|---|
| Premier League | 20/20 | ok | ok | keine |
| La Liga | 20/20 | ok | ok | keine |
| Bundesliga | 18/18 | ok | ok | keine |
| Serie A | 20/20 | ok | ok | keine |
| Ligue 1 | 18/18 | ok | ok | keine |

Geprüfte Regeln: Teamzahl (20 bzw. 18), `Punkte = 3·S + U`, `Spiele = S + U + N`,
`Tordifferenz = Tore − Gegentore`, Summe Siege = Summe Niederlagen, Summe Tore = Summe Gegentore.
Dieselben Regeln laufen als Vitest (`src/lib/dataInvariants.test.ts`) und als Warnung in der Entwicklung
(`[data] … table looks inconsistent`).

Hinweis: Punktabzüge würden als Arithmetik-Fehler auffallen; die Feeds markieren sie nicht.

## 2. WM 2026

| Prüfung | Ergebnis |
|---|---|
| Elfmeterspiele (Sechzehntelfinale, z. B. Deutschland – Paraguay) | vorher 4:5, jetzt 1:1, i. E. 3:4, Sieger Paraguay (Test mit echtem Payload) |
| Spiele mit Verlängerung (z. B. Belgien – Senegal) | 3:2 n. V., nach 90 Min. 2:2 |
| Gruppentabellen aus dem Archiv | 12 Gruppen × 4 Teams, Reihenfolge nach Punkten → direktem Vergleich → Tordifferenz → Tore |
| Beste Dritte | genau 8 markiert, deckungsgleich mit den Teams im echten Sechzehntelfinale |
| Kaderalter | zum Eröffnungstag (11.06.2026), nicht zum heutigen Datum |

## 3. Bewusst nicht angezeigt (Daten fehlen in den freien Quellen)

- Spielminuten (ESPN liefert nur Einsätze und Einwechslungen) → Startelf-Quote und Werte pro Einsatz.
- Europa-/Conference-League-Plätze (hängen von Pokalsiegern und UEFA-Zusatzplätzen ab).
- WM-Spielorte, Aufstellungen, Spielverlauf und Statistiken (nicht im kostenlosen football-data.org-Tarif).

## 4. Offene Punkte

- Stale-Kennzeichnung aus dem Proxy (`x-cache: stale`) erreicht die UI noch nicht → Phase 3 (Proxy-Spezifikation).
- Stichprobe gegen die offiziellen Ligaseiten steht noch aus (manuell).
