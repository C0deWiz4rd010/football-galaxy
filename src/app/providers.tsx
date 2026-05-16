import type { PropsWithChildren } from 'react'

import { ThemeProvider } from 'next-themes'

import { AppModeProvider } from '../contexts/AppModeContext'
import { DataSourceProvider } from '../contexts/DataSourceContext'
import { FavoritesProvider } from '../contexts/FavoritesContext'
import { LocaleProvider } from '../contexts/LocaleContext'
import { GalaxyProvider } from '../features/galaxy-map/context'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AppModeProvider>
        <DataSourceProvider>
          <LocaleProvider>
            <FavoritesProvider>
              <GalaxyProvider>{children}</GalaxyProvider>
            </FavoritesProvider>
          </LocaleProvider>
        </DataSourceProvider>
      </AppModeProvider>
    </ThemeProvider>
  )
}
