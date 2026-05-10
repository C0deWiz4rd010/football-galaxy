# UI/UX + Frontend Session Skill

## Purpose

This session skill combines current UI/UX and frontend interaction principles into one practical guide for Football Galaxy.

It is the active design and interaction reference for the current implementation session.

## Sources

Primary references used on `2026-05-10`:

- Apple Human Interface Guidelines: [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback)
- Apple Human Interface Guidelines: [Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Apple Human Interface Guidelines: [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- Apple Human Interface Guidelines: [Focus and selection](https://developer.apple.com/design/Human-Interface-Guidelines/focus-and-selection?changes=_9)
- Material Design: [Data tables](https://m1.material.io/components/data-tables.html)
- Motion: [Hover-triggered animations](https://motion.dev/docs/hover)
- Motion: [React hover animation guide](https://motion.dev/docs/react-hover-animation)
- Motion: [React gestures](https://motion.dev/docs/react-gestures?via=cptv8)

## Core Principles

### 1. Feedback must be immediate and local

Interactive elements need visible hover, focus, active, selected, loading, and success/failure states near the item being interacted with.

Apply to Football Galaxy:

- league rows react on hover and focus
- nav items show active destination clearly
- toggles visibly switch state
- cards should not move in a distracting way just because the pointer passes over them

### 2. Motion must explain, not decorate

Motion should orient the user, reinforce hierarchy, and support interaction. It should not exist just to “look animated”.

Apply to Football Galaxy:

- page transitions should be subtle and consistent
- hover motion should be short and precise
- selected rows and cards can highlight or glow, not bounce
- overlay and drawer motion should match their entry direction

### 3. Hover must be device-safe

Hover interactions should not create sticky states on touch devices.

Apply to Football Galaxy:

- prefer Motion `whileHover` and `whileTap` on interactive components
- avoid CSS-only hover patterns that imply hidden state changes
- every hover affordance must also have focus-visible support

### 4. Data tables are primary information surfaces

Tables must support:

- row hover
- row selection or navigation
- visible sorting state
- readable numeric alignment
- clear target affordances

Apply to Football Galaxy:

- the standings table is the main information surface
- the full table should stay visible in the main view
- clicking a row should clearly open the team view

### 5. Information density should be intentional

The dashboard should prioritize:

1. table
2. key league context
3. storylines
4. secondary charts and cards

Apply to Football Galaxy:

- the first hero block cannot dominate too much vertical space
- support cards should be smaller and denser
- the user should see standings immediately without feeling blocked by decorative content

### 6. Focus and selection must be explicit

Users need clear confirmation about:

- what is interactive
- what is hovered
- what is focused
- what is selected
- what opens a deeper view

Apply to Football Galaxy:

- rows need hover state, focus ring, and open affordance
- cards need visible clickable structure
- side navigation must clearly indicate active league/page

### 7. Accessibility and theming are not optional polish

Light/dark theme, contrast, focus states, and non-color feedback should all remain functional.

Apply to Football Galaxy:

- avoid white-only text styles in shared shell components
- use token-based foreground/background values where possible
- keep dark and light theme behavior consistent

## Active Rules For This Session

- make the standings table the dominant dashboard element
- reduce oversized hero sections
- replace jumpy hover scaling with subtle highlight, border, glow, or x-offset feedback
- give every major interactive element a hover and focus-visible state
- improve navigation clarity before adding more decorative components
- use official-feeling league logos where possible, with robust fallback
- prioritize dense, readable football information over oversized cards
- add storyline cards only when they support the table, not compete with it

## Immediate Build Priorities

1. fix theme consistency in shared layout
2. improve league nav logos and nav clarity
3. rebuild dashboard with full-width standings table
4. improve table interactivity and affordances
5. add players and teams explorer pages
6. upgrade command/search palette
7. add storyline components like Rising Team, Form Monster, and Playmaker of the Week
