import { RouterProvider } from 'react-router-dom'

import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

import { AppProviders } from './providers'
import { router } from './router'

export function App() {
  return (
    <ErrorBoundary titleKey="errorBoundaryTitle">
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  )
}
