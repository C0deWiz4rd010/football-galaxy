import { createContext, type ReactNode, useContext, useEffect, useMemo, useReducer } from 'react'

interface FavoritesState {
  teams: string[]
  players: string[]
}

type FavoritesAction =
  | { type: 'TOGGLE_TEAM'; id: string }
  | { type: 'TOGGLE_PLAYER'; id: string }

interface FavoritesContextValue extends FavoritesState {
  toggleTeam: (id: string) => void
  togglePlayer: (id: string) => void
  isTeamFavorite: (id: string) => boolean
  isPlayerFavorite: (id: string) => boolean
}

const storageKey = 'football-favorites'
const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

function readInitialState(): FavoritesState {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      return { teams: [], players: [] }
    }
    const parsed = JSON.parse(stored) as FavoritesState
    return { teams: parsed.teams ?? [], players: parsed.players ?? [] }
  } catch {
    return { teams: [], players: [] }
  }
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

function reducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'TOGGLE_TEAM':
      return { ...state, teams: toggle(state.teams, action.id) }
    case 'TOGGLE_PLAYER':
      return { ...state, players: toggle(state.players, action.id) }
    default:
      return state
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, readInitialState)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state])

  const value = useMemo(
    () => ({
      ...state,
      toggleTeam: (id: string) => dispatch({ type: 'TOGGLE_TEAM', id }),
      togglePlayer: (id: string) => dispatch({ type: 'TOGGLE_PLAYER', id }),
      isTeamFavorite: (id: string) => state.teams.includes(id),
      isPlayerFavorite: (id: string) => state.players.includes(id),
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
