import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type AppMode = 'live' | 'ea-fc'

interface AppModeContextValue {
  mode: AppMode
  setMode: (mode: AppMode) => void
  toggleMode: () => void
}

const STORAGE_KEY = 'football-galaxy-app-mode'

const AppModeContext = createContext<AppModeContextValue | undefined>(undefined)

function readInitialMode(): AppMode {
  if (typeof window === 'undefined') {
    return 'live'
  }

  const storedMode = window.localStorage.getItem(STORAGE_KEY)
  return storedMode === 'ea-fc' ? 'ea-fc' : 'live'
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>(readInitialMode)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode)
    document.documentElement.dataset.appMode = mode
  }, [mode])

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode: () =>
        setMode((currentMode) => (currentMode === 'live' ? 'ea-fc' : 'live')),
    }),
    [mode],
  )

  return (
    <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>
  )
}

export function useAppModeContext() {
  const context = useContext(AppModeContext)

  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider')
  }

  return context
}
