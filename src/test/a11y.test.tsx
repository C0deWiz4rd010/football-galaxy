import axe from 'axe-core'
import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { Sidebar } from '@/components/layout/Sidebar'
import NotFound from '@/pages/NotFound'
import SettingsPage from '@/pages/Settings'
import { makeLeagueSummary } from '@/test/fixtures'
import { renderRoute } from '@/test/renderWithProviders'

vi.mock('@/services/footballData', () => ({
  getLeagueSummary: vi.fn(),
  getMatches: vi.fn(async () => []),
  formFromMatches: () => [],
}))

const football = await import('@/services/footballData')
const { default: LeagueDashboard } = await import('@/pages/LeagueDashboard')

/** axe-core against the rendered DOM; colour contrast needs real layout, so it is checked in the browser instead. */
async function violations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } })
  return result.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)
}

afterEach(() => vi.clearAllMocks())

describe('accessibility (axe)', () => {
  it('league dashboard', async () => {
    vi.mocked(football.getLeagueSummary).mockResolvedValue(makeLeagueSummary())
    const { container } = renderRoute(<LeagueDashboard />, { path: '/:leagueId', url: '/premier-league' })
    await screen.findByRole('heading', { name: /komplette tabelle|full standings/i })
    expect(await violations(container)).toEqual([])
  })

  it('navigation (sidebar and tab bar)', async () => {
    const { container } = renderRoute(
      <>
        <Sidebar />
        <MobileTabBar onSearch={() => undefined} onMenu={() => undefined} menuOpen={false} />
      </>,
      { path: '/:leagueId', url: '/premier-league' },
    )
    expect(await violations(container)).toEqual([])
  })

  it('settings and 404 pages', async () => {
    const settings = renderRoute(<SettingsPage />, { path: '/settings', url: '/settings' })
    expect(await violations(settings.container)).toEqual([])
    settings.unmount()
    const notFound = renderRoute(<NotFound />, { path: '*', url: '/nope' })
    expect(await violations(notFound.container)).toEqual([])
  })
})
