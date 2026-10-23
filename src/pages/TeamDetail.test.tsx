import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotFoundError } from '@/services/errors'
import { renderRoute } from '@/test/renderWithProviders'

import TeamDetail from './TeamDetail'

vi.mock('@/services/footballData', () => ({
  getTeam: vi.fn(),
  getSquad: vi.fn(async () => ({ teamId: '1', players: [] })),
  getStandings: vi.fn(async () => []),
  getMatches: vi.fn(async () => []),
  formFromMatches: () => [],
  withRecentForm: (standings: unknown) => standings,
}))

const football = await import('@/services/footballData')
const getTeam = vi.mocked(football.getTeam)

const renderTeam = () => renderRoute(<TeamDetail />, { path: '/:leagueId/team/:teamId', url: '/premier-league/team/999' })

afterEach(() => vi.clearAllMocks())

describe('TeamDetail states', () => {
  it('shows "not found" for an unknown club instead of loading forever', async () => {
    getTeam.mockRejectedValue(new NotFoundError('Unknown team 999'))
    renderTeam()

    expect(await screen.findByText(/nicht gefunden|not found/i)).toBeInTheDocument()
    expect(getTeam).toHaveBeenCalledTimes(1)
  })

  it('shows a retryable error when the sources fail', async () => {
    getTeam.mockRejectedValue(new Error('All live sources failed'))
    renderTeam()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /erneut versuchen|try again/i })).toBeInTheDocument()
  })
})
