# Data Command Center Concept Prompts

Date: 2026-05-17

## Saved Concepts

- `docs/concepts/main-dashboard-command-center-2026-05-17.png`
- `docs/concepts/team-detail-command-center-2026-05-17.png`
- `docs/concepts/player-detail-command-center-2026-05-17.png`

## Main Dashboard Prompt

Create a polished desktop product-dashboard screenshot for Football Galaxy, a football top-5 leagues analytics app. Style: Data Command Center, compact, premium, highly readable, no marketing hero. 1440x1024 viewport. German UI labels. Left sidebar with all top five leagues visible, compact favorites, live-proxy status, language switch. Main La Liga dashboard: dense league header with leader, best attack, best defense, form king; large standings table visible above the fold with compact legend underneath; right-side insights rail with spotlight player photo, top scorers, top assists, upcoming fixtures, data freshness indicator. Use realistic football club badges/photos as placeholders but keep UI code-native. No nested cards, no oversized rounded cards, no decorative blobs, no purple-heavy palette. The table, live data status, and comparison metrics are the visual priority. Render as a high-fidelity UI concept screenshot, crisp typography, all text legible, balanced spacing, modern football analytics dashboard, restrained light interface with green live status, amber attack, blue defense, teal form, rose favorites.

## Team Detail Prompt

Create a polished Football Galaxy team detail dashboard screenshot. Style: Data Command Center, compact professional football analytics. 1440x1024 desktop viewport, German UI. Show Liverpool FC team detail above the fold: compact identity header with crest, table rank, points, goal difference, form, manager, stadium, squad size, next fixture. Main area has squad table with player photos, apps, goals, assists, yellow cards, form and nationality visible without scrolling. Include a tactical mini-panel, top performer card, recent results strip, and team strengths/weaknesses. Strong hierarchy, beautiful icon colors matching status meanings, no marketing copy, no nested cards. Render as a high-fidelity UI concept screenshot, crisp typography, all text legible, dense but calm, restrained light interface with navy sidebar, green live status, amber attack, blue defense, teal form, rose favorites. The squad table and key team read must be visible in one scan.

## Player Detail Prompt

Create a polished Football Galaxy player profile dashboard screenshot. Style: Data Command Center, compact and innovative but highly usable. 1440x1024 desktop viewport, German UI. Show Erling Haaland or Kylian Mbappe style star football player profile with real-looking portrait area, team badge, position, age, nationality, availability, season apps, goals, assists, minutes, cards, form. Above the fold includes production tiles, shot/assist contribution chart, role comparison, recent match log, similar players mini-list, and data source/freshness badge. Make everything glanceable without scroll except deeper analytics. Use restrained dark-on-light dashboard palette with navy sidebar, green live status, amber attack, blue defense, teal form, rose favorites. No fake marketing hero, no decorative blobs, no huge empty panels. Render as high-fidelity UI concept screenshot, crisp typography, all text legible, code-native controls and tables, compact professional football analytics.

## UX Notes

- Main dashboard should keep the league table as the primary object. Header stats and right rail support scanning; they must not push the table below the first viewport.
- Team detail should behave like an analyst workbench: compact identity row, squad table first, tactical and strengths panels on the right.
- Player detail should put portrait, availability, season production, role comparison, recent matches, and similar players above the fold.
- Icon colors should carry meaning: live green, attack amber/red, defense blue, form teal, favorites rose/amber, source freshness green or slate.
- Use compact surfaces with 6-8px radii, restrained shadows, and no nested cards.
- Any implementation should preserve multilingual UI by sourcing visible text from the existing locale layer where practical.
