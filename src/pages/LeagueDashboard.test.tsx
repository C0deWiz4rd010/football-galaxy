import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { makeLeagueSummary } from '@/test/fixtures'
import { renderRoute } from '@/test/renderWithProviders'

import LeagueDashboard from './LeagueDashboard'

vi.mock('@/services/footballData', () => ({
  getLeagueSummary: vi.fn(),
}))

const football = await import('@/services/footballData')
const getLeagueSummary = vi.mocked(football.getLeagueSummary)

const summary = makeLeagueSummary()

const renderDashboard = (url = '/premier-league') => renderRoute(<LeagueDashboard />, { path: '/:leagueId', url })

afterEach(() => {
  vi.clearAllMocks()
})

describe('LeagueDashboard', () => {
  it('renders the standings surface once the summary resolves', async () => {
    getLeagueSummary.mockResolvedValue(summary)
    renderDashboard()

    expect(await screen.findByRole('heading', { name: /full standings table|komplette tabelle/i })).toBeInTheDocument()
    expect(screen.getAllByText(/premier league/i).length).toBeGreaterThan(0)
    expect(getLeagueSummary).toHaveBeenCalledWith(expect.objectContaining({ leagueId: 'premier-league' }))
  })

  it('shows a recoverable error card with a working retry when the load fails', async () => {
    getLeagueSummary.mockRejectedValueOnce(new Error('All live sources failed')).mockResolvedValueOnce(summary)
    renderDashboard()

    expect(await screen.findByText('All live sources failed')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /erneut versuchen|try again/i }))
    expect(await screen.findByRole('heading', { name: /full standings table|komplette tabelle/i })).toBeInTheDocument()
    expect(getLeagueSummary).toHaveBeenCalledTimes(2)
  })

  it('shows a not-found state for an unknown league without fetching', () => {
    renderDashboard('/not-a-league')

    expect(screen.getByText(/seite nicht gefunden|page not found/i)).toBeInTheDocument()
    expect(getLeagueSummary).not.toHaveBeenCalled()
  })
})
