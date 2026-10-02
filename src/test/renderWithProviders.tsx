import type { ReactElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { DataSourceProvider } from '@/contexts/DataSourceContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { LocaleProvider } from '@/contexts/LocaleContext'

/** Fresh, retry-free query client per test so cached data never leaks between tests. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
}

export function renderRoute(
  element: ReactElement,
  { path, url, queryClient = createTestQueryClient() }: { path: string; url: string; queryClient?: QueryClient },
) {
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <DataSourceProvider>
        <LocaleProvider>
          <FavoritesProvider>
            <MemoryRouter initialEntries={[url]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path={path} element={element} />
              </Routes>
            </MemoryRouter>
          </FavoritesProvider>
        </LocaleProvider>
      </DataSourceProvider>
    </QueryClientProvider>,
  )
  return { ...utils, queryClient }
}
