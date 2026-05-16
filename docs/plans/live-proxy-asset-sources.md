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

## Recommended Asset Source Order

1. TheSportsDB artwork
   - Best first source for club badges, player cutouts, thumbs, and league artwork.
   - Already aligns with the current live service implementation.

2. Wikidata for entity resolution
   - Good source for stable IDs and metadata lookups.
   - Wikidata data itself is CC0.

3. Wikimedia Commons for media fallback
   - Useful for missing player photos or club imagery when a properly licensed file exists.
   - Must be validated per file because reuse obligations differ by asset.
   - Attribution and license compliance are required where applicable.

4. Generated SVG placeholders
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
