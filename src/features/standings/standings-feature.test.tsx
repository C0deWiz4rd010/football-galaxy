import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import type { LeagueStandings, StandingsProvider } from '../../services'
import { StandingsFeature } from './standings-feature'

function createWrapper(provider: StandingsProvider) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <StandingsFeature leagueId="premier-league" provider={provider} />
    </QueryClientProvider>,
  )
}

const standingsFixture: LeagueStandings = {
  leagueId: 'premier-league',
  leagueLabel: 'Premier League',
  season: {
    startDate: '2025-08-15',
    endDate: '2026-05-24',
    currentMatchday: 12,
  },
  source: 'football-data.org',
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

describe('StandingsFeature', () => {
  it('renders the standings table from normalized data', async () => {
    createWrapper({
      getStandings: async () => standingsFixture,
    })

    expect(
      await screen.findByRole('heading', { name: /current standings/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Liverpool')).toBeInTheDocument()
    expect(screen.getByText('29')).toBeInTheDocument()
  })

  it('renders an empty state when no standings exist', async () => {
    createWrapper({
      getStandings: async () => ({
        ...standingsFixture,
        standings: [],
      }),
    })

    expect(
      await screen.findByRole('heading', { name: /no standings available/i }),
    ).toBeInTheDocument()
  })

  it('renders an error state when the provider fails', async () => {
    createWrapper({
      getStandings: async () => {
        throw new Error('Request failed')
      },
    })

    expect(
      await screen.findByRole('heading', { name: /unable to load standings/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/request failed/i)).toBeInTheDocument()
  })
})
