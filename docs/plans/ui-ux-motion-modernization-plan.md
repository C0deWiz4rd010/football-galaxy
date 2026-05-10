# Football Galaxy UI/UX + Motion Modernization Plan

## Goal

Football Galaxy should evolve from a mixed prototype into a cohesive, modern, interactive football product with:

- one clear app architecture
- one visual system
- one motion system
- stable routing and data flows
- polished loading, empty, and error states
- premium desktop and mobile UX

This plan focuses on the current website, not on building a video product. The Remotion plugin is still useful here as a motion-design reference for timing, sequencing, and transition discipline.

## Current Audit Summary

### 1. The app currently has two competing architectures

The repository contains an older multi-page dashboard app and a newer standings-first app at the same time.

Examples:

- `src/App.tsx` mounts the older route shell with sidebar, header, compare, team, and player pages.
- `src/app/app.tsx` and `src/app/router.tsx` define a different newer structure around `DashboardPage`.
- `src/main.tsx` currently imports `src/App.tsx`, so the newer `src/app/*` flow is not actually the main runtime entry.

Impact:

- duplicated concepts
- unclear source of truth
- harder debugging
- inconsistent UI
- features that appear partially wired or abandoned

### 2. There are two design systems active at once

The codebase mixes:

- `src/index.css` using Tailwind tokens and shadcn-style primitives
- `src/shared/styles/globals.css` using a second custom token system for the newer standings experience

Impact:

- inconsistent colors, spacing, surfaces, and typography
- parts of the UI likely feel like different products
- animation and polish cannot become coherent until design tokens are unified

### 3. The product scope grew faster than the structure

The current app includes:

- league dashboard
- compare page
- team detail
- player detail
- mock data
- live API switching
- historical data
- favorites
- command palette

That is already a medium-sized product, but the information architecture still feels prototype-like. The app needs prioritization around the main user journey instead of continuing to add disconnected surfaces.

### 4. Quality signals confirm real instability

Verification results:

- `npm run test`: passes
- `npm run lint`: fails with multiple errors
- `npm run build`: fails in the current environment because TypeScript cannot write `.tsbuildinfo` into `node_modules/.tmp`

Important lint findings include:

- state updates inside effects
- invalid or fragile React Fast Refresh patterns
- unsafe optional chaining with non-null assertions
- an unused-expression error in `src/pages/Compare.tsx`
- hook dependency issues

Impact:

- some broken behavior is likely architectural, not only visual
- motion polish should happen after basic stability and app consolidation

### 5. Motion exists as a dependency, but not yet as a system

`framer-motion` is installed, but the app does not appear to use a unified motion language. At the moment, motion likely risks becoming decorative rather than functional.

The Remotion guidance is helpful here:

- define explicit timing ranges
- reuse a small set of easing curves
- separate timing from property mapping
- use transitions to support narrative and orientation, not just flair

For the website, we should apply those ideas through a frontend motion spec using CSS and Framer Motion.

## Product Direction Recommendation

Recommended direction: `Modern Matchday Intelligence`

Position the product between:

- editorial sports storytelling
- premium live dashboard clarity
- tactile, cinematic motion

Desired feel:

- refined, data-rich, but not cluttered
- energetic without feeling noisy
- immersive without harming readability

Avoid:

- generic SaaS dashboard visuals
- random gradients with no hierarchy
- too many card styles
- motion on every element
- building team/player/compare flows further before the core dashboard is coherent

## Role Of Remotion In This Project

Remotion should not become the runtime layer for the website UI.

Recommended use of the Remotion plugin:

- define animation timing references
- prototype hero motion concepts
- create branded reveal sequences or social promo assets later
- derive reusable easing and sequencing rules for the app

Recommendation:

- keep runtime website animations in `Framer Motion + CSS`
- use Remotion principles to author the motion language
- optionally add Remotion later for marketing assets, launch loops, social promos, or cinematic hero experiments

## Recommended Structural Direction

Choose one primary architecture and consolidate the codebase around it.

Recommendation:

- keep `React + Vite + TypeScript + Tailwind`
- keep the newer `src/app`, `src/features`, `src/shared`, `src/services` direction
- migrate or rewrite useful older page features into that structure
- remove duplicate legacy layers only after migration is complete

### Target folder direction

```text
src/
  app/
    app.tsx
    router.tsx
    providers.tsx
    app-shell.tsx
  pages/
    dashboard/
    league/
    team/
    player/
    compare/
  features/
    standings/
    league-overview/
    team-form/
    player-leaders/
    filters/
    favorites/
  shared/
    ui/
    styles/
    motion/
    assets/
    i18n/
    lib/
  services/
    api/
    config/
    mappers/
    queries/
    schemas/
  data/
    mock/
    historical/
```

### Immediate architecture rule

There must be exactly one:

- app entry
- router
- app shell
- design token source
- query/data access pattern

## UX Problems To Solve First

### Primary user journey is not focused enough

The core first impression should be:

1. choose league
2. instantly understand standings state
3. explore form, leaders, context, and team detail

Right now the project appears split between experimental surfaces instead of one polished funnel.

### Navigation likely feels fragmented

Current navigation includes sidebar, mobile tab bar, page-level flows, and query-param driven views. This should be simplified into:

- one clear desktop nav
- one clear mobile nav
- one league-switch model
- consistent drill-down patterns

### Information hierarchy needs a rebuild

The landing/dashboard should answer in order:

1. What league am I in?
2. What phase of the season is this?
3. Who is leading and why?
4. What changed recently?
5. Where can I go next?

### States need premium treatment

Every data section needs:

- skeleton loading state
- empty state with explanation
- error state with retry and fallback wording
- partial-data state when live data is incomplete

## Visual System Plan

### Visual concept

Recommended concept: `Cinematic Editorial Matchday`

Core traits:

- deep stadium-night base
- sharp, premium typography
- restrained neon or league-accent highlights
- layered translucent surfaces
- subtle field/grid textures
- rich spacing and strong rhythm

### Visual system decisions to make

- choose one typography pairing with a distinct display face
- define one spacing scale
- define one radius system
- define one elevation system
- define one accent strategy for league identity
- define one data-visualization palette

### Design token categories

Create a single source of truth for:

- color
- typography
- spacing
- radius
- border
- shadow
- blur
- z-index
- motion duration
- motion easing

### Component standardization targets

Standardize these first:

- app shell
- page container
- hero/header block
- section heading
- stat card
- table shell
- chip/badge
- segmented control
- tabs
- empty state
- skeleton
- modal/sheet

## Motion Design Plan

### Motion principles

Use motion to improve:

- orientation
- hierarchy
- perceived responsiveness
- delight at key moments

Do not use motion as decoration without UX purpose.

### Motion language

Define a small reusable motion system:

- `enter`: fast ease-out for cards and content
- `emphasize`: short pop for score, rank, or active tab
- `shift`: horizontal transition for league or matchday changes
- `reveal`: progressive stagger for dashboard sections
- `overlay`: modal, drawer, and command palette transitions

### Recommended easing set

Inspired by the Remotion timing guidance, define a tiny shared easing library:

- primary enter: `cubic-bezier(0.16, 1, 0.3, 1)`
- soft editorial fade: `cubic-bezier(0.45, 0, 0.55, 1)`
- exit: `cubic-bezier(0.32, 0, 0.67, 0)`

### Recommended duration scale

- 120ms: tap/press feedback
- 180ms: chip, tab, and small hover transitions
- 240ms: card entrance and filter changes
- 320ms: page-section transitions
- 420ms: hero and staged reveals

### Motion implementation rules

- animate groups, not everything
- preserve instant interaction for tables and dense stats
- respect `prefers-reduced-motion`
- avoid continuous looping motion except for subtle ambient accents
- use shared motion tokens in code, not ad hoc timings

### Motion opportunities

- animated league switcher
- section stagger on initial dashboard load
- smooth table-shell transition between loading and resolved state
- contextual highlight when a team row is selected or focused
- hero accent glow that reacts to league theme
- mobile bottom nav indicator glide
- command palette open/close choreography

## Recommended Product Structure

### Phase 1 focus

The main dashboard should become the product centerpiece.

Desktop structure:

- persistent shell
- league hero
- summary metrics strip
- main standings panel
- secondary insight rail
- recent momentum or match context

Mobile structure:

- compact sticky top bar
- horizontal league selector
- swipe-friendly summary cards
- simplified standings presentation
- drill-down CTA blocks

### Feature priority order

Prioritize in this order:

1. dashboard shell and standings UX
2. league switching and state transitions
3. data reliability and state handling
4. team detail
5. compare and advanced exploration
6. player detail polish

Recommendation:

- do not polish `Compare` first
- do not extend player features first
- make the league dashboard excellent before expanding depth

## Phased Implementation Plan

## Phase 0: Stabilization Audit

Goal:

- identify what is current, what is legacy, and what is broken

Tasks:

- map active runtime entrypoints
- mark legacy components/pages
- fix lint blockers that point to real runtime risk
- adjust build output path for TypeScript incremental metadata if needed
- document migration candidates vs deletion candidates

Files likely involved:

- `src/main.tsx`
- `src/App.tsx`
- `src/app/app.tsx`
- `src/app/router.tsx`
- `tsconfig.app.json`
- `tsconfig.node.json`
- lint-flagged files

Success criteria:

- clear decision on the canonical app entry
- known list of obsolete files
- lint error categories prioritized

## Phase 1: App Consolidation

Goal:

- move the app to one architecture and one navigation model

Tasks:

- switch runtime to the canonical app structure
- consolidate routing
- define one shell for desktop and mobile
- migrate only the most valuable legacy screens
- remove dead or duplicated wiring after migration

Success criteria:

- no competing route systems
- no duplicate shell concepts
- simpler mental model for future work

## Phase 2: Design System Unification

Goal:

- create one premium visual language

Tasks:

- merge `src/index.css` and `src/shared/styles/globals.css` into one token strategy
- define visual tokens and component primitives
- standardize card, table, badge, and shell styling
- introduce a stronger typography direction

Success criteria:

- consistent surfaces and spacing across the app
- every screen looks like the same product

## Phase 3: Dashboard UX Rebuild

Goal:

- redesign the main league dashboard around clarity and excitement

Tasks:

- rebuild the hero block
- improve standings readability and scanning
- create a stronger right-rail or stacked insight layout
- improve empty/error/loading states
- ensure responsive behavior is intentional rather than compressed desktop UI

Success criteria:

- the dashboard feels premium on first load
- users can understand league state in seconds

## Phase 4: Motion System Rollout

Goal:

- apply a coherent motion language without hurting performance

Tasks:

- create shared motion tokens and helpers
- add entry, filter, overlay, and route transition patterns
- animate league switching and dashboard state changes
- add reduced-motion fallbacks

Suggested file area:

- `src/shared/motion/`

Success criteria:

- transitions feel intentional and consistent
- motion supports usability and brand feel

## Phase 5: Feature Reliability Pass

Goal:

- ensure the polished UI is backed by reliable behavior

Tasks:

- audit API failure handling
- normalize loading and partial-data behavior
- improve fallback asset handling
- verify compare, team, and player routes still justify their existence
- cut weak features if they dilute quality

Success criteria:

- fewer broken states
- more confidence to expand later

## Phase 6: Detail Pages And Advanced Interactions

Goal:

- only after the dashboard is strong, refine deeper product flows

Tasks:

- redesign team detail around trends, squad, and recent performance
- rebuild compare only if it delivers real value
- improve player detail information architecture
- add richer transitions between dashboard and detail views

Success criteria:

- deeper pages feel like a continuation of the main product, not side projects

## Suggested First Build Order

If implementation starts next, the safest order is:

1. consolidate runtime architecture
2. unify styles and tokens
3. redesign dashboard shell
4. add motion primitives
5. repair broken feature flows
6. revisit detail pages

## Testing And Review Plan

For each phase, verify:

- build works
- lint passes or has explicitly accepted exceptions
- tests cover critical data mapping and state transitions
- desktop and mobile layouts are reviewed manually
- reduced-motion behavior is checked

Add or expand tests for:

- router behavior
- dashboard loading/error/empty states
- league switching
- data-source switching

## Risks

- trying to preserve every existing page may slow the cleanup too much
- adding motion before architecture cleanup may multiply inconsistency
- continuing with two visual systems will block premium polish
- keeping low-value features alive may reduce overall product quality

## Recommendation For The Next Implementation Cycle

The next cycle should not start with isolated visual tweaks.

It should start with a structured modernization sprint:

1. choose the canonical app architecture
2. remove duplication
3. unify design tokens
4. rebuild the league dashboard as the flagship experience
5. add a shared motion system inspired by Remotion timing discipline

## Definition Of Done For The Modernized Version

Football Galaxy should feel complete when:

- the app has one clear structure
- the main dashboard is visually premium and easy to scan
- interactions feel responsive and elegant
- motion is consistent and subtle
- desktop and mobile both feel designed, not merely adapted
- the product is stable enough to expand with team, player, fixture, and future game features
