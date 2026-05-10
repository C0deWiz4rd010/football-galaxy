import { createContext, type ReactNode, useContext, useMemo, useReducer } from 'react'

type DataSource = 'live' | 'historical'

interface DataSourceState {
  source: DataSource
  season: string
  availableSeasons: string[]
}

type DataSourceAction =
  | { type: 'SET_SOURCE'; source: DataSource }
  | { type: 'SET_SEASON'; season: string }

interface DataSourceContextValue extends DataSourceState {
  setSource: (source: DataSource) => void
  setSeason: (season: string) => void
}

const DataSourceContext = createContext<DataSourceContextValue | undefined>(undefined)

const initialState: DataSourceState = {
  source: 'historical',
  season: '2022-23',
  availableSeasons: ['2024-25', '2022-23', '2021-22'],
}

function reducer(state: DataSourceState, action: DataSourceAction): DataSourceState {
  switch (action.type) {
    case 'SET_SOURCE':
      return {
        ...state,
        source: action.source,
        season: action.source === 'live' ? '2024-25' : state.season === '2024-25' ? '2022-23' : state.season,
      }
    case 'SET_SEASON':
      return { ...state, season: action.season }
    default:
      return state
  }
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(
    () => ({
      ...state,
      setSource: (source: DataSource) => dispatch({ type: 'SET_SOURCE', source }),
      setSeason: (season: string) => dispatch({ type: 'SET_SEASON', season }),
    }),
    [state],
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
