# Football Galaxy Phase 2 Product + Information Architecture Plan

## Purpose

Before Phase 3 starts, this document defines what Football Galaxy should actually show, how the app should be structured, which user flows matter, and which free data sources can realistically support the first product version.

This plan is the product blueprint for the next implementation cycle.

## Product Vision

Football Galaxy should become a modern football hub with two connected modes:

- `Galaxy Live` for real football data, standings, team context, player context, fixtures, and story-driven league exploration
- `EA FC Mode` for collectible-style presentation, card views, archetypes, ratings, and comparison experiences inspired by football games

The key idea is:

- one app
- two presentation modes
- shared core entities
- different visual treatments and interactions

## Core Experience

The app should answer these questions quickly:

1. What is happening in this league right now?
2. Which clubs are rising, falling, and why?
3. Which players stand out?
4. What does this team or player look like in detail?
5. How would this player feel in an EA FC style card view?

## Main Navigation Structure

Recommended top-level navigation:

- `Dashboard`
- `Leagues`
- `Teams`
- `Players`
- `Compare`
- `EA FC Mode`

Recommended shell behavior:

- desktop: left navigation rail + top contextual header
- mobile: bottom navigation + sticky compact filter/header area

## Global App Model

The whole app should be built around four core entities:

- `League`
- `Team`
- `Player`
- `Match`

Two presentation layers consume the same entities:

- `Live presentation layer`
- `EA FC presentation layer`

This means the app should not duplicate player/team models just because the UI changes.

## Information Architecture

## 1. Dashboard

The dashboard is the main product entry.

### Goal

Give users an immediate high-level understanding of one selected league.

### Content

- league identity hero
- current season and matchday
- standings table
- title race / Europe race / relegation focus
- top scorers
- top assists
- recent form leaders
- match of the week or latest key result
- trend summaries

### Key interactions

- switch league
- switch matchday or season where available
- jump to team page
- jump to player page
- toggle between `Live` and `EA FC` visual mode where relevant

### Recommended layout

- hero header
- summary strip
- main standings panel
- side insight rail
- featured teams/players strip

## 2. League Page

The league page is a deeper version of the dashboard and should answer:

- who leads
- who scores
- who creates
- which clubs are hot or cold
- what recent match context explains the table

### Content blocks

- league hero
- standings table
- form table
- attacking leaders
- defensive leaders
- fixtures or recent results
- featured club cards
- featured player cards

### Nice additions

- “race tracker” for title / Champions League / relegation zones
- league-wide trend chips
- mini timeline for recent matchdays

## 3. Team Page

The team page should feel like a mini club hub.

### Team info to show

- crest
- club name
- league
- stadium
- manager or coach if available
- founded year if available
- squad size
- average age
- league position
- points
- goal difference
- form over the last 5 matches

### Team performance sections

- form graph
- recent results timeline
- attack vs defense summary
- home vs away summary if data is available
- top contributors
- squad table
- likely featured XI block later

### Squad table should support

- search
- sort
- position filter
- favorites
- open player profile
- open EA FC card modal

### Nice additions

- “club identity” card using colors, venue, style tags, and momentum
- “players to watch” rail
- compact chemistry-style links later in EA FC mode

## 4. Player Page

The player page is one of the most important areas for delight.

### Base player info

- name
- photo
- club
- league
- nationality
- age
- height
- preferred position
- squad number
- contract until if available
- market value only if we have a legal and reliable free source later

### Performance info

- appearances
- minutes
- goals
- assists
- yellow cards
- red cards
- form trend
- recent contribution summary

### Visual components for player pages

- radar chart / spider chart
- stat bars for headline abilities
- trend chart
- comparison CTA
- favorite button
- badge chips for role and style

### Radar chart recommendation

Radar charts should be shown when the data can be mapped into a compact attribute model such as:

- pace
- shooting
- passing
- dribbling
- defending
- physical

For the first version, these values can be:

- derived from available football stats plus heuristics
- or taken from curated mock attributes if live APIs do not provide enough detail

Important:

- mark derived attributes clearly
- do not imply official EA or scouting accuracy

## 5. Compare Page

The compare page should become a signature feature.

### Core use cases

- compare two players
- compare two teams later
- compare `Live stats` vs `EA FC style attributes`

### Compare view should include

- side-by-side player headers
- core numbers
- radar chart
- trend delta
- archetype labels
- strengths / weaknesses summary

### Nice additions

- “who fits better?” helper cards
- visual diff bars
- compare by role template such as winger, striker, midfielder

## 6. Players Explorer

Recommended new page:

- `Players`

### Purpose

Give users a searchable discovery surface across available players.

### Features

- search by name
- filter by league
- filter by club
- filter by position
- favorites only
- switch between `list`, `grid`, and `EA FC card` views

This page will make the player system feel deliberate rather than hidden behind team pages.

## 7. Teams Explorer

Recommended new page:

- `Teams`

### Features

- browse all clubs
- filter by league
- show current position and form
- jump to team hub
- toggle compact or editorial card layouts

## EA FC Mode

## Purpose

EA FC Mode should be a playful alternate presentation layer, not a separate disconnected app.

### Entry points

- global switch in the header
- player card CTA on player pages
- compare page mode toggle
- team squad cards can open in EA FC presentation

### What changes in EA FC Mode

- stronger card visuals
- rating-first presentation
- card backgrounds by rarity/archetype
- stat grid instead of editorial summary blocks
- chemistry or role chips
- compact comparison flows

### What stays shared

- routing
- entities
- fetched data
- favorites
- filters
- compare relationships

## EA FC card ideas

### Player card fields

- overall rating
- position
- nation
- club
- league
- six headline attributes
- rarity tier
- role/archetype

### Card variants

- `Base`
- `In Form`
- `Captain`
- `Future Star`
- `League Hero`

These are product concepts, not licensed EA card types. Naming and styling should avoid trademark confusion.

### Rating model

For phase 1 of this mode, ratings should be internal and derived, not official.

Recommended pipeline:

1. normalize real stats
2. weight them by position
3. derive six attributes
4. derive overall rating
5. assign archetype and rarity style

## Suggested Derived Attribute Logic

For early versions, build an internal attribute engine:

- forwards weight goals, shots, contributions, minutes
- midfielders weight assists, passing, involvement, minutes
- defenders weight clean-sheet-related team context, defending proxy stats, discipline, minutes
- goalkeepers later get their own profile model

This gives the app a fun, ownable layer even before richer APIs exist.

## Data Source Strategy

Verified on `2026-05-10`.

## First-step API rule

For the first implementation step, use only:

- free sources
- no registration required
- frontend-safe public access when possible

## Recommended source mix

### 1. TheSportsDB

Use for:

- team metadata
- player metadata
- badges and images
- basic league and event context

Why:

- free public v1 key exists
- no signup required for the basic setup
- good visual asset support

Known limitations:

- free tier is rate limited
- coverage can be uneven
- some advanced endpoints are limited
- not ideal as the only source for rich player attributes

### 2. OpenLigaDB

Use for:

- fixtures
- results
- matchday-driven context
- standings support where available

Why:

- free access without authentication
- straightforward JSON endpoints
- strong fit for match and schedule context

Known limitations:

- strongest on league and match data, weaker on player richness
- metadata consistency varies by competition

### 3. openfootball / football.json

Use for:

- historical seasons
- fallback fixture/result datasets
- archive mode

Why:

- no API key required
- public domain historical JSON
- excellent fallback and archive base

Known limitations:

- not a rich live player source
- best for schedules, results, and historical structure

## Transfermarkt API assessment

Recommendation for first step:

- do **not** plan around Transfermarkt data

Reason:

- I did not find an official free public Transfermarkt API for app integration
- the options that surface publicly are typically unofficial wrappers or marketplace APIs that require signup or are legally/operationally risky

Conclusion:

- for phase 1, do not depend on Transfermarkt
- if market values become important later, evaluate legal and technical options separately

## What the first real product version should show

The first strong product version should include:

### Dashboard

- selected league hero
- standings
- top scorers
- top assists
- featured match/result
- recent form

### Team pages

- club header
- league position summary
- form line
- recent matches
- squad table
- top contributors

### Player pages

- player header
- basic bio
- season numbers
- radar chart
- trend chart
- related team link
- compare CTA
- EA FC card modal CTA

### Compare

- player vs player
- radar and stat diff
- `Live` vs `EA FC` toggle

### EA FC Mode

- player cards
- derived overall ratings
- six headline attributes
- archetype labels

## Content Priority

Build and polish in this order:

1. dashboard
2. team page
3. player page
4. compare page
5. players explorer
6. teams explorer
7. richer EA FC mode

## Feature Ideas Worth Adding

### Smart labels

Examples:

- “Form Monster”
- “Chance Creator”
- “Set-Piece Threat”
- “Defensive Anchor”
- “Box Crasher”

### Momentum storytelling

- rising team indicator
- cold streak alerts
- player spotlight callout

### Interactive details

- hover/focus stat explanations
- expandable recent match summaries
- click player from scorer lists into profile
- favorites shelf across the app

### Seasonal views

- current season
- historical archive
- compare with prior season later

## Product Rules

- every important screen must work in mobile and desktop
- every data area must support loading, empty, and error states
- derived ratings must be labeled as app-generated
- `EA FC Mode` must feel playful but not disconnected from the real-data app
- no legal dependence on unofficial scraped data in the first release

## Phase 3 Planning Requirements

Before Phase 3 implementation starts, we should lock:

- the exact page list for v1
- the core data model for `League`, `Team`, `Player`, and `Match`
- which fields are real vs derived
- the visual distinction between `Galaxy Live` and `EA FC Mode`
- the rating formula for derived player cards

## Recommended Phase 3 Deliverable Plan

Phase 3 should be split into these implementation tracks:

1. `Design system unification`
2. `Dashboard rebuild`
3. `Team and player information architecture`
4. `Derived player attribute engine`
5. `EA FC mode UI layer`
6. `Compare experience redesign`

## Recommended Next Step

The next planning artifact should be:

- a Phase 3 implementation plan that converts this product blueprint into concrete components, routes, data mappers, and UI sections

This document should be the source of truth for what Football Galaxy is supposed to contain before visual rebuilding begins.
