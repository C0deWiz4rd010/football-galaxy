import { AlertTriangle } from 'lucide-react'

import { useProxyHealth } from '@/hooks/useProxyHealth'
import { useLocale } from '@/contexts/LocaleContext'

/**
 * Dev-only banner shown when the live-data proxy is unreachable. Without the
 * proxy every live request fails after several seconds of retries, which looks
 * like "endless loading". This tells the developer exactly how to fix it.
 */
export function ProxyHealthBanner() {
  const status = useProxyHealth()
  const { t } = useLocale()

  if (!import.meta.env.DEV || status !== 'offline') {
    return null
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex justify-center px-3 pt-3">
      <div className="flex w-full max-w-3xl items-start gap-3 rounded-fg-lg border border-amber-400/40 bg-amber-500/10 px-4 py-2.5 text-sm shadow-lg backdrop-blur">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div className="min-w-0">
          <p className="font-semibold text-amber-100">{t('proxyOfflineTitle')}</p>
          <p className="text-amber-100/80">
            {t('proxyOfflineHint')}{' '}
            <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[12px] text-amber-100">
              npm run dev:all
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}
