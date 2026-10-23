# Live-data proxy — specification

Two implementations follow this spec and share `proxy/rules.json`:

| | File | Used for |
|---|---|---|
| Node | `proxy/football-data-proxy.mjs` | local development (`npm run proxy:dev`) |
| PHP | `deploy/hostinger/api/live.php` | production on Hostinger shared hosting |

Both are tested by the same suite: `proxy/tests/proxy.test.mjs` (`PROXY_URL=… node --test proxy/tests/proxy.test.mjs`).

## Why a proxy

- The football-data.org key must stay on the server.
- Every visitor shares that key's **10 requests per minute**, so the budget is enforced here, not in the browser.
- A server cache answers most requests, which keeps the first paint fast (LCP) and survives upstream outages.

## Endpoint

| Request | Response |
|---|---|
| `GET {base}?target=<url-encoded https URL>` | upstream body (JSON) |
| `GET {base}?health=1` | `200 {"status":"ok"}` |
| `OPTIONS {base}` | `204` (CORS preflight) |
| any other method | `405` |

`{base}` is `/api/live` (Node) or `/api/live.php` (PHP); the app takes it from `VITE_LIVE_DATA_PROXY_URL`.

## Request checks (in this order)

1. **Method**: only `GET` / `OPTIONS`.
2. **Origin**: a request carrying an `Origin` header not listed in `ALLOWED_ORIGINS` gets `403`. Requests without `Origin` (same-origin `GET`) pass.
3. **Client rate limit**: `rules.clientRateLimit` per client IP (240 per minute; cache hits count too) → `429` with `Retry-After`.
4. **Target**: must be present (`400`), an absolute `https:` URL (`400`) on a host in `rules.hosts` (`403`), without credentials or a non-default port (`403`).

## Upstream call

- Only `GET`, no cookies, a fixed `User-Agent`, `Accept: application/json`. Redirects are **not** followed (none of the used endpoints redirect; following them would let an allowed host point the proxy elsewhere).
- `X-Auth-Token` is added for `api.football-data.org` only, from `FOOTBALL_DATA_API_KEY`.
- **Upstream budget**: `rules.upstreamBudget` (football-data.org: 10 per 60 s across *all* visitors). When exhausted, serve the stale copy if there is one, otherwise `429` with `Retry-After` = seconds until the window frees up.
- Timeout `rules.timeoutSeconds` (10 s); bodies above `rules.maxBodyBytes` (10 MB) are rejected (`502`).

## Cache

- Key: the full target URL. Only `200` responses are stored.
- TTL: the first `rules.ttl` entry whose `host` matches and whose `path` regex matches `pathname + search` of the target; otherwise `rules.defaultTtlSeconds`.
- Fresh (age < TTL) → served without an upstream call: `x-proxy-cache: hit`.
- Upstream `429`, `5xx`, timeout or network error with a cached copy younger than `rules.maxStaleSeconds` (7 days) → served with `x-proxy-cache: stale`.
- Fresh upstream response → `x-proxy-cache: miss`.

## Response headers

- `Content-Type` from upstream (JSON); `Cache-Control: public, max-age=<remaining TTL>` on `hit`/`miss`, `no-store` on `stale` and errors.
- `x-proxy-cache: hit | miss | stale`; `Retry-After` on `429`.
- Bodies are compressed (`br`/`gzip`) when the client accepts it (`Vary: Accept-Encoding`); upstream JSON shrinks 10–25×.
- CORS: `Access-Control-Allow-Origin` echoes an allowed `Origin` (never `*`), `Vary: Origin`, `Access-Control-Expose-Headers: x-proxy-cache, retry-after`.
- Errors are `{"error": "<short message>"}` — never upstream bodies, stack traces, keys or file paths. Upstream `4xx` statuses (e.g. `404`) pass through so the app can show "not found".

## Configuration

| Setting | Node (env) | PHP (env or config file) |
|---|---|---|
| football-data.org key | `FOOTBALL_DATA_API_KEY` | `FOOTBALL_DATA_API_KEY` |
| Allowed origins (comma-separated) | `ALLOWED_ORIGINS` (default `http://localhost:5173,http://127.0.0.1:5173`) | `ALLOWED_ORIGINS` (default: none — same-origin only) |
| Cache / rate-limit directory | in memory | `FG_PROXY_DATA_DIR` (default `api/cache`, denied by `.htaccess`) |
| Port | `PROXY_PORT` (8787) | — |

PHP reads the config file `football-galaxy-config.php` from the account's home directory (two levels above `public_html/api/`, outside the web root), then `api/config.php` (denied by `.htaccess`). Environment variables win. See `docs/deploy-hostinger.md`.
