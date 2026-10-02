import { useQuery } from '@tanstack/react-query'

import { getLiveProxyConfig } from '@/services/config/liveProxy'

export type ProxyHealth = 'checking' | 'ok' | 'offline' | 'disabled'

/** `?health=1` on the proxy endpoint itself works for any deploy path (Node or PHP). */
export function healthUrlFrom(baseUrl: string | undefined): string | null {
  if (!baseUrl) return null
  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}health=1`
}

const RETRY_DELAYS_MS = [15_000, 30_000, 60_000]

/**
 * Pings the live-data proxy so the UI can tell the user when it is not running
 * (the #1 cause of "endless loading, no data" during local development). While
 * offline it re-checks with a growing delay so the banner clears itself once
 * the proxy is up; once healthy it stops polling entirely.
 */
export function useProxyHealth(): ProxyHealth {
  const { baseUrl, isEnabled } = getLiveProxyConfig()
  const healthUrl = healthUrlFrom(baseUrl)

  const query = useQuery({
    queryKey: ['proxy-health', healthUrl],
    queryFn: async ({ signal }) => {
      const timeout = AbortSignal.timeout(3000)
      // AbortSignal.any is missing on older iOS Safari; the timeout alone is enough there.
      const combined = typeof AbortSignal.any === 'function' ? AbortSignal.any([signal, timeout]) : timeout
      const response = await fetch(healthUrl!, { signal: combined }).catch(() => null)
      return response?.ok ? ('ok' as const) : ('offline' as const)
    },
    enabled: isEnabled && Boolean(healthUrl),
    retry: false,
    staleTime: Infinity,
    meta: { persist: false, silent: true },
    refetchInterval: (current) =>
      current.state.data === 'ok'
        ? false
        : RETRY_DELAYS_MS[Math.min(current.state.dataUpdateCount, RETRY_DELAYS_MS.length - 1)],
  })

  if (!isEnabled || !healthUrl) return 'disabled'
  return query.data ?? 'checking'
}
