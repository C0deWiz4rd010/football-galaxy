import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { leagues } from '@/lib/leagues'
import { mockData } from '@/data/mock'
import type { LeagueSummary } from '@/services/types'

import LeagueDashboard from './LeagueDashboard'

vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn()],
}))

vi.mock('@/hooks/useFootballData', () => ({
  useFootballData: vi.fn(),
}))

vi.mock('@/contexts/DataSourceContext', () => ({
  useDataSource: () => ({ source: 'historical', season: '2022-23' }),
}))

vi.mock('@/hooks/useAppMode', () => ({
  useAppMode: () => ({ mode: 'live' }),
}))

const { useFootballData } = await import('@/hooks/useFootballData')

const summary: LeagueSummary = {
  league: leagues[0]!,
  season: {
    id: '2022-23',
    label: '2022/23',
    startDate: '2022-08-01T00:00:00Z',
    endDate: '2023-05-31T23:59:59Z',
    currentMatchday: 38,
  },
  standings: mockData['premier-league'].standings,
  topScorers: mockData['premier-league'].topScorers,
  topAssists: mockData['premier-league'].topAssists,
  recentMatches: mockData['premier-league'].recentMatches,
  teams: mockData['premier-league'].teams,
}

describe('LeagueDashboard', () => {
  beforeEach(() => {
    vi.mocked(useFootballData).mockReturnValue({
      data: summary,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it('renders the main standings surface', () => {
    render(
      <FavoritesProvider>
        <MemoryRouter initialEntries={['/premier-league']}>
          <Routes>
            <Route path="/:leagueId" element={<LeagueDashboard />} />
          </Routes>
        </MemoryRouter>
      </FavoritesProvider>,
    )

    expect(screen.getByRole('heading', { name: /full standings table/i })).toBeInTheDocument()
    expect(screen.getByText(/premier league/i)).toBeInTheDocument()
  })
})
