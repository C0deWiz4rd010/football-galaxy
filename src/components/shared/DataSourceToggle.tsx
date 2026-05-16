import { RadioTower } from 'lucide-react'

import { useDataSource } from '@/contexts/DataSourceContext'

export function DataSourceToggle() {
  const {
    source,
    runtimeLabel,
    proxyStatus,
    isLiveAvailable,
    setSource,
  } = useDataSource()

  return (
    <div
      className="app-pill hidden items-center gap-2 p-1 text-xs text-muted-foreground xl:flex"
      title={
        proxyStatus === 'configured'
          ? 'A live proxy is configured. You can switch between local fallback and proxy-backed live data.'
          : 'No live proxy configured. Browser runtime stays on local fallback data.'
      }
    >
      <span className="flex items-center gap-2 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <RadioTower className="h-3.5 w-3.5" />
        {runtimeLabel}
      </span>
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
      >
        Local
      </button>
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
      >
        Live Proxy
      </button>
    </div>
  )
}
