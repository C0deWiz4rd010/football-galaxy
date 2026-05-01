import { createBrowserRouter } from 'react-router-dom'

import { DashboardPage } from '../pages/dashboard/dashboard-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
])
