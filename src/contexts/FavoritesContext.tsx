import { createContext, type ReactNode, useContext, useEffect, useMemo, useReducer } from 'react'

import type { LeagueId } from '@/services/types'

/**
 * A favorite stores a small display snapshot (name, image, league) so the
 * sidebar can render it instantly on every route without loading league data.
 */
export interface FavoriteEntry {
  id: string
  leagueId: LeagueId
  name: string
  image?: string
}

interface FavoritesState {
  teams: FavoriteEntry[]
  players: FavoriteEntry[]
}

type FavoritesAction =
  | { type: 'TOGGLE'; kind: keyof FavoritesState; entry: FavoriteEntry }
  | { type: 'REMOVE'; kind: keyof FavoritesState; id: string }

interface FavoritesContextValue extends FavoritesState {
  toggleTeam: (entry: FavoriteEntry) => void
  togglePlayer: (entry: FavoriteEntry) => void
  removeTeam: (id: string) => void
  removePlayer: (id: string) => void
  isTeamFavorite: (id: string) => boolean
  isPlayerFavorite: (id: string) => boolean
}

// v2 stores snapshots. v1 stored bare ids, most of which pointed at the old
// mock catalog and cannot be resolved any more, so v1 data is discarded.
const storageKey = 'football-favorites-v2'
const legacyStorageKey = 'football-favorites'
const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

const isEntry = (value: unknown): value is FavoriteEntry =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as FavoriteEntry).id === 'string' &&
  typeof (value as FavoriteEntry).name === 'string' &&
  typeof (value as FavoriteEntry).leagueId === 'string'

function readInitialState(): FavoritesState {
  try {
    localStorage.removeItem(legacyStorageKey)
    const stored = localStorage.getItem(storageKey)
    if (!stored) return { teams: [], players: [] }
    const parsed = JSON.parse(stored) as Partial<Record<keyof FavoritesState, unknown[]>>
    return {
      teams: (parsed.teams ?? []).filter(isEntry),
      players: (parsed.players ?? []).filter(isEntry),
    }
  } catch {
    return { teams: [], players: [] }
  }
}

function reducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  const list = state[action.kind]
  switch (action.type) {
    case 'TOGGLE':
      return {
        ...state,
        [action.kind]: list.some((item) => item.id === action.entry.id)
          ? list.filter((item) => item.id !== action.entry.id)
          : [...list, action.entry],
      }
    case 'REMOVE':
      return { ...state, [action.kind]: list.filter((item) => item.id !== action.id) }
    default:
      return state
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, readInitialState)

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch {
      // Storage full or blocked: favorites stay for this session only.
    }
  }, [state])

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ...state,
      toggleTeam: (entry) => dispatch({ type: 'TOGGLE', kind: 'teams', entry }),
      togglePlayer: (entry) => dispatch({ type: 'TOGGLE', kind: 'players', entry }),
      removeTeam: (id) => dispatch({ type: 'REMOVE', kind: 'teams', id }),
      removePlayer: (id) => dispatch({ type: 'REMOVE', kind: 'players', id }),
      isTeamFavorite: (id) => state.teams.some((item) => item.id === id),
      isPlayerFavorite: (id) => state.players.some((item) => item.id === id),
    }),
    [state],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return context
}
