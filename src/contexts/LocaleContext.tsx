import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type Locale = 'de' | 'en'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const STORAGE_KEY = 'football-galaxy-locale'

const messages: Record<Locale, Record<string, string>> = {
  de: {
    playersExplorer: 'Spieler-Explorer',
    teamsExplorer: 'Team-Explorer',
    comparePlayers: 'Spieler vergleichen',
    explore: 'Entdecken',
    leagues: 'Ligen',
    favorites: 'Favoriten',
    search: 'Suche',
    back: 'Zurück',
    openMenu: 'Menü öffnen',
    toggleTheme: 'Theme wechseln',
    language: 'Sprache',
    liveMode: 'Live',
    eaMode: 'EA FC',
    eaModeSoon: 'EA FC bald',
    commandTitle: 'Schnellsuche',
    commandDescription: 'Durchsuche Ligen, Teams und Spieler.',
  },
  en: {
    playersExplorer: 'Players Explorer',
    teamsExplorer: 'Teams Explorer',
    comparePlayers: 'Compare Players',
    explore: 'Explore',
    leagues: 'Leagues',
    favorites: 'Favorites',
    search: 'Search',
    back: 'Back',
    openMenu: 'Open menu',
    toggleTheme: 'Toggle theme',
    language: 'Language',
    liveMode: 'Live',
    eaMode: 'EA FC',
    eaModeSoon: 'EA FC soon',
    commandTitle: 'Quick search',
    commandDescription: 'Search leagues, teams, and players.',
  },
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'de'
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'de'
}

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<Locale>(readInitialLocale)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale === 'de' ? 'de' : 'en'
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string) => messages[locale][key] ?? key,
    }),
    [locale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)

  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }

  return context
}
