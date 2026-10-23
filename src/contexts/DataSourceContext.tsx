import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'

import { currentSeasonId } from '@/lib/season'

// The app is live-only. This context owns the active season, which is part of
// every football query key.
interface DataSourceContextValue {
  season: string
  availableSeasons: string[]
  setSeason: (_season: string) => void
}

// Computed once per page load so the season rolls over automatically.
const DEFAULT_SEASON = currentSeasonId()

const DataSourceContext = createContext<DataSourceContextValue | undefined>(undefined)

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState(DEFAULT_SEASON)

  const value = useMemo<DataSourceContextValue>(
    () => ({ season, availableSeasons: [DEFAULT_SEASON], setSeason }),
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
