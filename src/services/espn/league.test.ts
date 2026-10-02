import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
vi.mock('@/services/thesportsdb/teams', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/thesportsdb/teams')>()),
  getTeamMetaIndex: vi.fn(async () => ({
    byEspnId: new Map([['359', { stadium: 'Emirates Stadium', capacity: 60704 }]]),
    byName: new Map([['arsenal', { manager: 'Mikel Arteta' }]]),
  })),
}))
vi.mock('@/services/wikidata', () => ({ withWikidataPortrait: vi.fn(async (player: unknown) => player) }))

import { LiveHttpError, fetchLiveJson } from '@/services/net/liveClient'

const fetchMock = vi.mocked(fetchLiveJson)

const team = (id: string, name: string, abbreviation: string) => ({
  id,
  displayName: name,
  abbreviation,
  color: 'ff0000',
  logos: [{ href: `https://a.espncdn.com/${id}.png`, rel: ['full', 'default'] }],
})

const event = (id: string, homeId: string, awayId: string, state: 'pre' | 'in' | 'post', homeScore: string, awayScore: string, date: string) => ({
  id,
  date,
  competitions: [
    {
      status: { type: { state, completed: state === 'post' } },
      competitors: [
        { id: homeId, homeAway: 'home', score: { value: Number(homeScore), displayValue: homeScore } },
        { id: awayId, homeAway: 'away', score: homeScore === '' ? undefined : awayScore },
      ],
    },
  ],
})

function routes(url: string): unknown {
  if (url.endsWith('/eng.1/teams')) {
    return { sports: [{ leagues: [{ teams: [{ team: team('359', 'Arsenal', 'ARS') }, { team: team('382', 'Manchester City', 'MNC') }] }] }] }
  }
  if (url.endsWith('/eng.1/standings')) {
    const stats = (rank: number, points: number) => [
      { name: 'rank', value: rank },
      { name: 'gamesPlayed', value: 2 },
      { name: 'wins', value: points / 3 },
      { name: 'ties', value: 0 },
      { name: 'losses', value: 2 - points / 3 },
      { name: 'pointsFor', value: 4 },
      { name: 'pointsAgainst', value: 2 },
      { name: 'pointDifferential', value: 2 },
      { name: 'points', value: points },
    ]
    return {
      children: [
        {
          standings: {
            entries: [
              { team: { id: '382' }, stats: stats(2, 3) },
              { team: { id: '359' }, stats: stats(1, 6) },
            ],
          },
        },
      ],
    }
  }
  if (url.endsWith('/eng.1/scoreboard')) {
    return { events: [event('e3', '359', '382', 'pre', '0', '0', '2026-10-10T14:00Z')] }
  }
  if (url.endsWith('/eng.1/statistics')) {
    return {
      stats: [
        { name: 'goalsLeaders', leaders: [{ value: 5, athlete: { id: '9', displayName: 'Erling Haaland', team: { id: '382' }, statistics: [{ name: 'totalGoals', value: 5 }, { name: 'appearances', value: 2 }] } }] },
        { name: 'assistsLeaders', leaders: [{ value: 3, athlete: { id: '7', displayName: 'Bukayo Saka', team: { id: '359' }, statistics: [{ name: 'goalAssists', value: 3 }] } }] },
      ],
    }
  }
  if (url.includes('/teams/359/schedule')) {
    return url.includes('fixture=true')
      ? { events: [event('e3', '359', '382', 'pre', '0', '0', '2026-10-10T14:00Z')] }
      : { events: [event('e1', '359', '382', 'post', '2', '1', '2026-08-20T14:00Z'), event('e2', '382', '359', 'post', '0', '0', '2026-09-01T14:00Z')] }
  }
  if (url.includes('/schedule')) return { events: [] }
  if (url.includes('/athletes/9')) return { athlete: { id: '9', displayName: 'Erling Haaland', team: { id: '382' } } }
  if (url.includes('/athletes/404')) throw new LiveHttpError(404, 'espn')
  if (url.includes('/teams/382/roster')) {
    return {
      athletes: [
        {
          id: '9',
          displayName: 'Erling Haaland',
          jersey: '9',
          age: 26,
          position: { abbreviation: 'F' },
          statistics: { splits: { categories: [{ stats: [{ name: 'appearances', value: 2 }, { name: 'totalGoals', value: 5 }] }] } },
        },
      ],
    }
  }
  throw new Error(`unexpected ${url}`)
}

describe('ESPN league provider', () => {
  let league: typeof import('./league')

  beforeEach(async () => {
    vi.resetModules()
    fetchMock.mockImplementation(async (url: string) => routes(url) as never)
    league = await import('./league')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('builds a mock-free summary from five upstream calls', async () => {
    const summary = await league.getLeagueSummary('premier-league')

    expect(summary.standings.map((row) => row.team.name)).toEqual(['Arsenal', 'Manchester City'])
    expect(summary.standings[0]).toMatchObject({ points: 6, played: 2, form: [] })
    expect(summary.teams.find((item) => item.id === '359')).toMatchObject({ stadium: 'Emirates Stadium', manager: 'Mikel Arteta', primaryColor: '#ff0000' })
    expect(summary.topScorers[0]).toMatchObject({ goals: 5, player: { id: 'espn-9', name: 'Erling Haaland', teamId: '382' } })
    expect(summary.topAssists[0]?.player.name).toBe('Bukayo Saka')
    expect(summary.playerPool).toHaveLength(2)
    // Two clubs play a two-matchday season, so the next round is clamped to 2.
    expect(summary.season.currentMatchday).toBe(2)
    expect(summary.recentMatches[0]).toMatchObject({ status: 'SCHEDULED', homeScore: undefined })
    // teams, standings, scoreboard, statistics (TheSportsDB metadata is mocked)
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('derives form from club schedules', async () => {
    const matches = await league.getTeamMatches('premier-league', '359')
    expect(matches.map((match) => match.status)).toEqual(['FINISHED', 'FINISHED', 'SCHEDULED'])
    expect(league.formFromMatches(matches, '359').map((item) => item.result)).toEqual(['W', 'D'])
    expect(league.formFromMatches(matches, '382').map((item) => item.result)).toEqual(['L', 'D'])
  })

  it('resolves a player via the athlete lookup and the club roster', async () => {
    const player = await league.getPlayer('premier-league', 'espn-9')
    expect(player).toMatchObject({ name: 'Erling Haaland', teamId: '382', position: 'FW', age: 26, stats: { goals: 5, appearances: 2 } })
  })

  it('reports unknown teams and players as not found', async () => {
    await expect(league.getTeam('premier-league', 'nope')).rejects.toMatchObject({ notFound: true })
    await expect(league.getPlayer('premier-league', 'espn-404')).rejects.toMatchObject({ notFound: true })
    await expect(league.getPlayer('premier-league', 'mock-player-1')).rejects.toMatchObject({ notFound: true })
  })
})
