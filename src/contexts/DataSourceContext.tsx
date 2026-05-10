import { createContext, type ReactNode, useContext } from 'react'

type DataSource = 'live'

interface DataSourceContextValue {
  source: DataSource
  season: string
  availableSeasons: string[]
  setSource: (_source: DataSource) => void
  setSeason: (_season: string) => void
}

const DataSourceContext = createContext<DataSourceContextValue | undefined>(undefined)

const value: DataSourceContextValue = {
  source: 'live',
  season: '2025-26',
  availableSeasons: ['2025-26'],
  setSource: () => {},
  setSeason: () => {},
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  return <DataSourceContext.Provider value={value}>{children}</DataSourceContext.Provider>
}

export function useDataSource() {
  const context = useContext(DataSourceContext)
  if (!context) {
    throw new Error('useDataSource must be used within DataSourceProvider')
  }
  return context
}
