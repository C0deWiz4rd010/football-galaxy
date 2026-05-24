import { useSearchParams } from 'react-router-dom'

import { AppShell } from '../../app/app-shell'
import { StandingsDashboard } from '../../features/standings'
import {
  parseLanguage,
  type LanguageCode,
} from '../../shared/i18n/dashboard-locale'
import { LanguageSelector } from '../../shared/ui/language-selector'

const LANGUAGE_QUERY_PARAM = 'lang'

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const language = parseLanguage(searchParams.get(LANGUAGE_QUERY_PARAM))

  function handleLanguageSelect(nextLanguage: LanguageCode) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(LANGUAGE_QUERY_PARAM, nextLanguage)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <AppShell
      headerActions={
        <LanguageSelector
          language={language}
          onSelect={handleLanguageSelect}
        />
      }
    >
      <StandingsDashboard language={language} />
    </AppShell>
  )
}
