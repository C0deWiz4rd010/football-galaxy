import { useEffect, useState } from 'react'

import { getLiveProxyConfig } from '@/services/config/liveProxy'

export type ProxyHealth = 'checking' | 'ok' | 'offline' | 'disabled'

function healthUrlFrom(baseUrl: string | undefined): string | null {
  if (!baseUrl) return null
  // baseUrl looks like http://localhost:8787/api/live -> swap the path for /health.
  try {
    const url = new URL(baseUrl)
    url.pathname = '/health'
    url.search = ''
    return url.toString()
  } catch {
    return null
  }
}

/**
 * Pings the live-data proxy's /health endpoint so the UI can tell the user when
 * the proxy is not running (the #1 cause of "endless loading, no data" during
 * local development). Re-checks periodically while offline so the banner clears
 * itself once `npm run dev:all` is up.
 */
export function useProxyHealth(): ProxyHealth {
  const { baseUrl, isEnabled } = getLiveProxyConfig()
  const [status, setStatus] = useState<ProxyHealth>(isEnabled ? 'checking' : 'disabled')

  useEffect(() => {
    const healthUrl = healthUrlFrom(baseUrl)
    if (!isEnabled || !healthUrl) {
      // Initial state already reflects the disabled case; nothing to poll.
      return
    }

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const check = async () => {
      const controller = new AbortController()
      const abortTimer = setTimeout(() => controller.abort(), 3000)
      try {
        const res = await fetch(healthUrl, { signal: controller.signal })
        if (cancelled) return
        setStatus(res.ok ? 'ok' : 'offline')
      } catch {
        if (cancelled) return
        setStatus('offline')
      } finally {
        clearTimeout(abortTimer)
      }
      // Keep polling only while offline so the banner self-heals; stop once ok.
      if (!cancelled) {
        timer = setTimeout(() => {
          void check()
        }, 15000)
      }
    }

    void check()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [baseUrl, isEnabled])

  return status
}
