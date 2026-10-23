import type { PropsWithChildren } from 'react'

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { ThemeProvider } from 'next-themes'

import { DataSourceProvider } from '../contexts/DataSourceContext'
import { FavoritesProvider } from '../contexts/FavoritesContext'
import { LocaleProvider } from '../contexts/LocaleContext'
import { PaletteProvider } from '../contexts/PaletteContext'

import { createPersistOptions, createQueryClient } from './queryClient'

const queryClient = createQueryClient()
const persistOptions = createPersistOptions()

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        <PaletteProvider>
          <DataSourceProvider>
            <LocaleProvider>
              <FavoritesProvider>{children}</FavoritesProvider>
            </LocaleProvider>
          </DataSourceProvider>
        </PaletteProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  )
}
