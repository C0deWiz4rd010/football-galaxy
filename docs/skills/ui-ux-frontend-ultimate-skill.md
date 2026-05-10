# UI/UX + Frontend Ultimate Skill

## Purpose

This is the active master skill for Football Galaxy.

It combines:

- current web UI/UX principles gathered from primary references
- the user-provided `frontend-design` direction
- the user-provided `senior-frontend` engineering discipline
- the user-provided `ui-ux-pro-max` interaction and accessibility rules
- the user-provided `ui-design-system` consistency model

The individual source files are stored alongside this document for traceability:

- [frontend-design-source.md](D:\Meine Projekte\football-galaxy\docs\skills\frontend-design-source.md)
- [senior-frontend-source.md](D:\Meine Projekte\football-galaxy\docs\skills\senior-frontend-source.md)
- [ui-ux-pro-max-source.md](D:\Meine Projekte\football-galaxy\docs\skills\ui-ux-pro-max-source.md)
- [ui-design-system-source.md](D:\Meine Projekte\football-galaxy\docs\skills\ui-design-system-source.md)

## External Reference Sources

Primary references used on `2026-05-10`:

- Apple Human Interface Guidelines: [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback)
- Apple Human Interface Guidelines: [Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Apple Human Interface Guidelines: [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- Apple Human Interface Guidelines: [Focus and selection](https://developer.apple.com/design/Human-Interface-Guidelines/focus-and-selection?changes=_9)
- Material Design: [Data tables](https://m1.material.io/components/data-tables.html)
- Motion: [Hover-triggered animations](https://motion.dev/docs/hover)
- Motion: [React hover animation guide](https://motion.dev/docs/react-hover-animation)
- Motion: [React gestures](https://motion.dev/docs/react-gestures?via=cptv8)

## Master Principles

### 1. Table-first football UX

The main league object is the standings table.

Rules:

- the full table must remain visible
- league context supports the table, not the other way around
- rows must feel clickable and safe to explore
- sorting, focus, and target affordances must be explicit

### 2. Distinctive but disciplined visual design

The app should feel designed, not generated.

Rules:

- strong aesthetic direction
- memorable hierarchy and composition
- no generic dashboard sameness
- no oversized decorative hero that blocks core information

### 3. Stable interaction feedback

Feedback must be immediate, local, and non-disruptive.

Rules:

- hover and focus are always visible on clickable elements
- cards and rows should highlight, not jump
- primary interactions must work on touch without hidden hover logic
- cursor, focus ring, border, and background changes should confirm interactivity

### 4. Motion with purpose

Motion explains, sequences, and supports hierarchy.

Rules:

- use short motion timings for micro-interactions
- prefer opacity, shadow, glow, and transform over layout shift
- no bounce-like hover effects on dense information cards
- respect `prefers-reduced-motion`

### 5. Theme integrity

Light and dark mode must both feel first-class.

Rules:

- readable text contrast in both themes
- visible borders in light mode
- no hard-coded white text in shared shells unless the background guarantees it
- use token-driven surfaces and foreground values

### 6. Design-system consistency

System-level decisions should be reusable.

Rules:

- one shared token language
- one set of surface behaviors
- one consistent interaction vocabulary across sidebar, cards, table rows, pills, and palette results

### 7. Engineering quality

Frontend polish cannot come at the expense of code health.

Rules:

- keep shared logic out of page clutter
- include loading, empty, and error states
- keep lint, build, and tests green
- write plans for major UI slices

## Football Galaxy-Specific Build Rules

- make the standings table the dominant dashboard element
- keep heroes compact and information-rich
- make team and player discovery available from multiple entry points
- use believable league branding with fallback-safe assets
- keep storyline cards compact and secondary
- use explorers and search as real navigation surfaces
- prefer dense, scan-friendly layouts over oversized marketing cards

## Active Checklist For Future UI Passes

- Does the first screen reveal the table fast enough?
- Is every clickable item obviously clickable?
- Do hover states avoid layout shift?
- Does light mode still look intentional?
- Is there a clear way from league -> team -> player -> compare?
- Are motion and story modules helping orientation instead of stealing attention?
