import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { getLiveProxyConfig } from '@/services/config/liveProxy'

type DataSource = 'live' | 'fallback'
type ProxyStatus = 'configured' | 'unavailable'

interface DataSourceContextValue {
  source: DataSource
  season: string
  availableSeasons: string[]
  proxyStatus: ProxyStatus
  proxyBaseUrl?: string
  isLiveAvailable: boolean
  runtimeLabel: string
  runtimeDetail: string
  setSource: (_source: DataSource) => void
  setSeason: (_season: string) => void
}

const STORAGE_KEY = 'football-galaxy-data-source'
const DEFAULT_SEASON = '2025-26'

const DataSourceContext = createContext<DataSourceContextValue | undefined>(undefined)

function readInitialSource(isLiveAvailable: boolean): DataSource {
  if (typeof window === 'undefined') {
    return 'fallback'
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'live' && isLiveAvailable ? 'live' : 'fallback'
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const { baseUrl: proxyBaseUrl, isEnabled: isLiveAvailable } = getLiveProxyConfig()
  const [source, setSourceState] = useState<DataSource>(() =>
    readInitialSource(isLiveAvailable),
  )
  const [season, setSeason] = useState(DEFAULT_SEASON)

  useEffect(() => {
    if (!isLiveAvailable && source === 'live') {
      setSourceState('fallback')
    }
  }, [isLiveAvailable, source])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, source)
  }, [source])

  const value = useMemo<DataSourceContextValue>(() => {
    const proxyStatus: ProxyStatus = isLiveAvailable ? 'configured' : 'unavailable'
    const runtimeLabel = source === 'live' ? 'Live Proxy' : 'Local Fallback'
    const runtimeDetail = source === 'live'
      ? 'Remote club, player, and standings data is loaded through the configured proxy.'
      : isLiveAvailable
        ? 'Local mock and historical data is active. Switch to the proxy-backed live feed when needed.'
        : 'No live proxy is configured, so the browser stays on stable local data.'

    return {
      source,
      season,
      availableSeasons: [DEFAULT_SEASON],
      proxyStatus,
      proxyBaseUrl,
      isLiveAvailable,
      runtimeLabel,
      runtimeDetail,
      setSource: (nextSource) => {
        if (nextSource === 'live' && !isLiveAvailable) {
          return
        }

        setSourceState(nextSource)
      },
      setSeason,
    }
  }, [isLiveAvailable, proxyBaseUrl, season, source])

  return <DataSourceContext.Provider value={value}>{children}</DataSourceContext.Provider>
}

export function useDataSource() {
  const context = useContext(DataSourceContext)
  if (!context) {
    throw new Error('useDataSource must be used within DataSourceProvider')
  }
  return context
}
