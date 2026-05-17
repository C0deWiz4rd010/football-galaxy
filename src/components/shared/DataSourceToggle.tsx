import { RadioTower } from 'lucide-react'

import { useDataSource } from '@/contexts/DataSourceContext'
import { useLocale } from '@/contexts/LocaleContext'

export function DataSourceToggle() {
  const {
    source,
    proxyStatus,
    isLiveAvailable,
    setSource,
  } = useDataSource()
  const { t } = useLocale()

  const runtimeLabel = source === 'live' ? t('liveProxy') : t('localFallback')
  const showLocalControls = import.meta.env.DEV

  return (
    <div
      className="app-pill hidden items-center gap-2 p-1 text-xs text-muted-foreground xl:flex"
      title={proxyStatus === 'configured' ? t('liveTooltip') : t('localTooltip')}
    >
      <span className="flex items-center gap-2 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <RadioTower
          className={[
            'h-3.5 w-3.5',
            source === 'live' ? 'text-emerald-400' : 'text-slate-400',
          ].join(' ')}
        />
        {runtimeLabel}
      </span>
      {showLocalControls ? (
        <button
          type="button"
          onClick={() => setSource('fallback')}
          className={[
            'rounded-full px-3 py-1.5 font-medium transition-all duration-200',
            source === 'fallback'
              ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(15,23,42,0.18)]'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
          aria-pressed={source === 'fallback'}
          title={t('localTooltip')}
        >
          {t('localMode')}
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => setSource('live')}
        disabled={!isLiveAvailable}
        className={[
          'rounded-full px-3 py-1.5 font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45',
          source === 'live'
            ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(15,23,42,0.18)]'
            : 'text-muted-foreground hover:text-foreground',
        ].join(' ')}
        aria-pressed={source === 'live'}
        title={t('liveTooltip')}
      >
        {t('liveProxy')}
      </button>
    </div>
  )
}
