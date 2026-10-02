import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { currentSeasonId } from '@/lib/season'
import { setSourcePreference } from '@/services/config/dataSource'

// The app is live-only: there is no local/fallback data source any more. The
// context is kept as the single place that owns the active season and signals
// the data layer to always run live loaders.
type DataSource = 'live'

interface DataSourceContextValue {
  source: DataSource
  season: string
  availableSeasons: string[]
  setSeason: (_season: string) => void
}

// Computed once per page load so the season rolls over automatically.
const DEFAULT_SEASON = currentSeasonId()

const DataSourceContext = createContext<DataSourceContextValue | undefined>(undefined)

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState(DEFAULT_SEASON)

  useEffect(() => {
    setSourcePreference('live')
  }, [])

  const value = useMemo<DataSourceContextValue>(
    () => ({
      source: 'live',
      season,
      availableSeasons: [DEFAULT_SEASON],
      setSeason,
    }),
    [season],
  )

  return <DataSourceContext.Provider value={value}>{children}</DataSourceContext.Provider>
}

export function useDataSource() {
  const context = useContext(DataSourceContext)
  if (!context) {
    throw new Error('useDataSource must be used within DataSourceProvider')
  }
  return context
}
