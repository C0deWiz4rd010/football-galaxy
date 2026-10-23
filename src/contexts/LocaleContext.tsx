import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { de, type MessageKey } from '@/i18n/de'
import { en } from '@/i18n/en'

export type Locale = 'de' | 'en'
export type { MessageKey }

const messages = { de, en }

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

const STORAGE_KEY = 'football-galaxy-locale'

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

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const raw = messages[locale][key] ?? key
      if (!vars) return raw
      return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
        Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`,
      )
    },
    [locale],
  )

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, t],
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

/** For UI primitives that may render outside the provider (tests, portals). */
export function useOptionalLocale() {
  return useContext(LocaleContext)
}
