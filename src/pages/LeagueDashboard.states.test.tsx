import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { LocaleProvider } from '@/contexts/LocaleContext'

import LeagueDashboard from './LeagueDashboard'

vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn()],
}))

vi.mock('@/hooks/useFootballData', () => ({
  useFootballData: vi.fn(),
}))

vi.mock('@/contexts/DataSourceContext', () => ({
  useDataSource: () => ({ source: 'live', season: '2025-26' }),
}))

const { useFootballData } = await import('@/hooks/useFootballData')

function renderDashboard() {
  return render(
    <LocaleProvider>
      <FavoritesProvider>
        <MemoryRouter initialEntries={['/premier-league']}>
          <Routes>
            <Route path="/:leagueId" element={<LeagueDashboard />} />
          </Routes>
        </MemoryRouter>
      </FavoritesProvider>
    </LocaleProvider>,
  )
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('LeagueDashboard states', () => {
  it('shows a recoverable error card with a working retry when the load fails', async () => {
    const refetch = vi.fn()
    vi.mocked(useFootballData).mockReturnValue({
      data: null,
      isLoading: false,
      error: 'All live sources failed',
      refetch,
      fetchedAt: null,
    })

    renderDashboard()

    expect(screen.getByText('All live sources failed')).toBeInTheDocument()
    const retry = screen.getByRole('button', { name: /erneut versuchen|try again/i })
    await userEvent.click(retry)
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('shows an empty state (never a blank screen) when there is no data and no error', () => {
    vi.mocked(useFootballData).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      fetchedAt: null,
    })

    renderDashboard()

    expect(
      screen.getByText(/keine liga.?daten|no league data/i),
    ).toBeInTheDocument()
  })
})
