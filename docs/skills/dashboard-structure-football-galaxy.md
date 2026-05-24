# Football Galaxy Dashboard Structure Skill

Use this local project skill when shaping Football Galaxy dashboards, detail pages, or dense data surfaces.

## Product Bias

Football Galaxy is a football data product, not a marketing page. Put the table, comparison, player, or squad object first. Cards should support scanning and decisions; they should not compete with the primary data.

## Layout Rules

- Keep first-screen dashboards compact enough that the main table or squad context appears immediately.
- Prefer one clear header band, then the primary table/detail object, then supporting cards.
- Avoid nested cards and oversized decorative panels.
- Use small stat tiles with clear labels, strong numbers, and short helper text.
- Make repeated controls stable in size so hover/focus states do not shift layout.

## Sidebar Rules

- Top-five league navigation should be fully visible on desktop.
- Favorites are secondary and should stay compact.
- Active league/team/player states should have a colored accent that matches the league or club theme.

## Data Quality Rules

- Prefer live, source-backed values over generated values.
- When a value is derived, make the UI and docs honest about it.
- Use fallback images only as fallbacks; do not present generated avatars as official photos.
- Keep loading, empty, and error states for every API-driven area.

## Table Rules

- Standings tables should explain abbreviations near the table.
- Promotion/Champions League/relegation accents need a visible legend.
- Mobile table cards may collapse details, but points, form, and navigation must remain obvious.

## Detail Page Rules

- Team pages should show identity, table position, squad size, form, and standout player in one scan.
- Player pages should show photo/identity, team, position, key production, availability, and discipline above the fold.
- Deeper charts belong below the quick read.

## Icon And Color Rules

- Use lucide icons for semantic cues.
- Give icons purposeful colors: live/status green, attack amber/red, defense blue, form purple/teal, favorites amber/rose.
- Avoid one-note color fields; theme accents should support, not flood, the interface.
