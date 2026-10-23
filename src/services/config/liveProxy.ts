import { DEV_PROXY_URL, normalizeProxyBase } from './proxyUrl'

export interface LiveProxyConfig {
  baseUrl?: string
  isEnabled: boolean
}

export function getLiveProxyConfig(): LiveProxyConfig {
  const baseUrl = normalizeProxyBase(
    import.meta.env.VITE_LIVE_DATA_PROXY_URL?.trim() ||
      (import.meta.env.DEV && import.meta.env.VITE_DISABLE_DEV_LIVE_PROXY !== 'true' ? DEV_PROXY_URL : ''),
  )

  return {
    baseUrl,
    isEnabled: Boolean(baseUrl),
  }
}

export function buildLiveRequestUrl(targetUrl: string) {
  const { baseUrl } = getLiveProxyConfig()

  if (!baseUrl) {
    return targetUrl
  }

  return `${baseUrl}?target=${encodeURIComponent(targetUrl)}`
}
