# Live Proxy And Asset Source Strategy

## Why This Exists

The browser cannot reliably call the current ESPN endpoints directly because of CORS.

A proxy is therefore required before Football Galaxy can run real live mode in a stable way.

## Implemented Proxy Surface

- Local proxy script: `proxy/football-data-proxy.mjs`
- Expected frontend env var: `VITE_LIVE_DATA_PROXY_URL`
- Endpoint shape: `/api/live?target=<encoded-https-url>`
- Allowed upstream hosts:
  - `www.thesportsdb.com`
  - `site.api.espn.com`
  - `site.web.api.espn.com`
  - `api.football-data.org`
  - `commons.wikimedia.org`
  - `upload.wikimedia.org`
  - `www.wikidata.org`
  - `crests.football-data.org`

## Recommended Asset Source Order

1. TheSportsDB artwork
   - Best first source for club badges, player cutouts, thumbs, and league artwork.
   - Already aligns with the current live service implementation.

2. ESPN roster statistics
   - Best current source in the app for per-player live season stats.
   - Used for appearances, goals, assists, cards, shots, shots on target, and saves.
   - Current endpoint split:
     - `site.api.espn.com/apis/site/v2` for teams, rosters, and scoreboards
     - `site.web.api.espn.com/apis/v2` for standings

3. Wikidata for entity resolution
   - Good source for stable IDs and metadata lookups.
   - Wikidata data itself is CC0.

4. Wikimedia Commons for media fallback
   - Useful for missing player photos or club imagery when a properly licensed file exists.
   - Must be validated per file because reuse obligations differ by asset.
   - Attribution and license compliance are required where applicable.

5. Generated SVG placeholders
   - Keep as the final fallback only.
   - Use when no verified licensed asset exists or while waiting for proxy-enriched live data.

## Important Product Constraint

Current local fallback leagues use partially fictionalized club identities such as `North London Royals` and `Manchester Albion`.

For those clubs there is no official real-world crest or player-photo set to fetch.

That means:

- correct official crests everywhere are impossible while those fictional fallback clubs remain the primary dataset
- generated crests are the correct fallback behavior for those entries
- full official branding requires either real club datasets or proxied live providers as the primary source

## Practical Next Step

If the product goal is official crests and player photos everywhere, replace the fallback mock leagues with real clubs and keep generated assets only for missing-edge cases.

## 2026-05-17 Implementation Note

The app now resolves visible top/detail player images through Wikidata -> Wikimedia Commons when ESPN roster payloads do not provide headshots. This is intentionally targeted so league dashboard loads do not trigger dozens of TheSportsDB player-photo requests and hit Cloudflare rate limits.
