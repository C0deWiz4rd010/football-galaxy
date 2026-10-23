/** Dev proxy (`npm run proxy:dev`); vite.config.ts uses the same value for the data preload. */
export const DEV_PROXY_URL = 'http://localhost:8787/api/live'

/** Trailing slashes trimmed, so `${base}?target=` matches what index.html preloads. */
export function normalizeProxyBase(url: string | undefined): string | undefined {
  const trimmed = url?.trim().replace(/\/$/, '')
  return trimmed || undefined
}
