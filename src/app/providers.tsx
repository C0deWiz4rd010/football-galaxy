import type { PropsWithChildren } from 'react'

import { ThemeProvider } from 'next-themes'

import { DataSourceProvider } from '../contexts/DataSourceContext'
import { FavoritesProvider } from '../contexts/FavoritesContext'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <DataSourceProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </DataSourceProvider>
    </ThemeProvider>
  )
}
