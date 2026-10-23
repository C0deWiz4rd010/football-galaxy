import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/net/liveClient', () => {
  class LiveHttpError extends Error {
    status: number
    constructor(status: number) {
      super(`HTTP ${status}`)
      this.status = status
    }
  }
  return { fetchLiveJson: vi.fn(), LiveHttpError }
})

import { fetchLiveJson } from '@/services/net/liveClient'
import { worldCupKnockoutMatches } from '@/test/payloads/worldCupKnockout'
import { renderRoute } from '@/test/renderWithProviders'

import { WorldCupMatchDetailPage } from './WorldCupPages'

const fetchMock = vi.mocked(fetchLiveJson)

afterEach(() => vi.clearAllMocks())

describe('World Cup match page', () => {
  it('shows a shoot-out as a draw after extra time plus the penalty result', async () => {
    // Real payload: Germany 1:1 Paraguay a.e.t., 3:4 on penalties (football-data sends fullTime 4:5).
    fetchMock.mockResolvedValue(worldCupKnockoutMatches.shootout as never)

    renderRoute(<WorldCupMatchDetailPage />, {
      path: '/world-cup-2026/match/:matchId',
      url: `/world-cup-2026/match/fd-${worldCupKnockoutMatches.shootout.id}`,
    })

    // Final score and the 90-minute score are both 1:1.
    expect(await screen.findAllByText('1:1')).toHaveLength(2)
    expect(screen.getByText('Paraguay gewinnt 4:3 im Elfmeterschießen')).toBeInTheDocument()
    expect(screen.queryByText('4:5')).not.toBeInTheDocument()
  })
})
