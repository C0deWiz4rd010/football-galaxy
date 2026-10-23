import { AlertTriangle } from 'lucide-react'

import { useProxyHealth } from '@/hooks/useProxyHealth'
import { useLocale } from '@/contexts/LocaleContext'

/**
 * Explains "endless loading" when no data can arrive:
 * - development: the proxy process is not running (with the command to start it);
 * - production: the build has no proxy configured (e.g. a GitHub Pages build
 *   without VITE_LIVE_DATA_PROXY_URL — the providers block direct browser
 *   calls) or the configured proxy is unreachable.
 */
export function ProxyHealthBanner() {
  const status = useProxyHealth()
  const { t } = useLocale()

  const devOffline = import.meta.env.DEV && status === 'offline'
  const prodProblem = !import.meta.env.DEV && (status === 'disabled' || status === 'offline')
  if (!devOffline && !prodProblem) return null

  return (
    <div className="fixed inset-x-0 top-0 z-banner flex justify-center px-3 pt-3" role="status">
      <div className="flex w-full max-w-3xl items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm shadow-lg backdrop-blur">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
        <div className="min-w-0">
          {devOffline ? (
            <>
              <p className="font-semibold text-warning-fg">{t('proxyOfflineTitle')}</p>
              <p className="text-warning-fg/80">
                {t('proxyOfflineHint')}{' '}
                <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs text-warning-fg">npm run dev:all</code>
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-warning-fg">
                {status === 'disabled' ? t('proxyMissingTitle') : t('proxyUnreachableTitle')}
              </p>
              <p className="text-warning-fg/80">{status === 'disabled' ? t('proxyMissingHint') : t('proxyUnreachableHint')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
