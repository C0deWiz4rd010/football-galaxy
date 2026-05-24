export interface LiveProxyConfig {
  baseUrl?: string
  isEnabled: boolean
}

export function getLiveProxyConfig(): LiveProxyConfig {
  const configured =
    import.meta.env.VITE_LIVE_DATA_PROXY_URL?.trim() ||
    (import.meta.env.DEV && import.meta.env.VITE_DISABLE_DEV_LIVE_PROXY !== 'true'
      ? 'http://localhost:8787/api/live'
      : '')
  const baseUrl = configured ? configured.replace(/\/$/, '') : undefined

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
