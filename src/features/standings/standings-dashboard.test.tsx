import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { LeagueStandings, StandingsProvider } from '../../services'
import { StandingsDashboard } from './standings-dashboard'

const standingsFixture: LeagueStandings = {
  leagueId: 'premier-league',
  leagueLabel: 'Premier League',
  season: {
    label: '2025-2026',
    currentMatchday: 12,
  },
  source: 'the-sports-db',
  standings: [
    {
      position: 1,
      team: {
        id: 64,
        name: 'Liverpool FC',
        shortName: 'Liverpool',
        tla: 'LIV',
        crestUrl: null,
      },
      played: 12,
      won: 9,
      draw: 2,
      lost: 1,
      goalsFor: 28,
      goalsAgainst: 10,
      goalDifference: 18,
      points: 29,
    },
  ],
}

function renderDashboard(provider: StandingsProvider) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
      <MemoryRouter initialEntries={['/']}>
      <QueryClientProvider client={queryClient}>
        <StandingsDashboard provider={provider} language="en" />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('StandingsDashboard', () => {
  it('switches leagues through the selector', async () => {
    const user = userEvent.setup()

    renderDashboard({
      getStandings: async (leagueId) => ({
        ...standingsFixture,
        leagueId,
        leagueLabel: leagueId === 'la-liga' ? 'La Liga' : 'Premier League',
      }),
    })

    expect(
      await screen.findByRole('heading', { name: /premier league/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /spain la liga/i }))

    expect(
      await screen.findByRole('heading', { name: /^la liga$/i }),
    ).toBeInTheDocument()
  })
})
