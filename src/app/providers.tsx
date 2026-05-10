import type { PropsWithChildren } from 'react'

import { ThemeProvider } from 'next-themes'

import { AppModeProvider } from '../contexts/AppModeContext'
import { DataSourceProvider } from '../contexts/DataSourceContext'
import { FavoritesProvider } from '../contexts/FavoritesContext'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppModeProvider>
        <DataSourceProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </DataSourceProvider>
      </AppModeProvider>
    </ThemeProvider>
  )
}
