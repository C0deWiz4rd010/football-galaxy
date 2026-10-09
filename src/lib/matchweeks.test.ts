import { describe, expect, it } from 'vitest'

import { makeTeam } from '@/test/fixtures'
import type { Match } from '@/services/types'

import { currentMatchweekIndex, groupMatchweeks } from './matchweeks'

const match = (id: string, utcDate: string, status: Match['status']): Match => ({
  id,
  leagueId: 'premier-league',
  season: '2026-27',
  matchday: 0,
  utcDate,
  status,
  homeTeam: makeTeam(0),
  awayTeam: makeTeam(1),
  events: [],
})

describe('matchweeks', () => {
  const matches = [
    match('a', '2026-09-19T14:00:00Z', 'FINISHED'),
    match('b', '2026-09-21T15:30:00Z', 'FINISHED'),
    match('c', '2026-09-27T14:00:00Z', 'FINISHED'),
    match('d', '2026-09-28T19:00:00Z', 'SCHEDULED'),
    match('e', '2026-10-04T14:00:00Z', 'SCHEDULED'),
  ]

  it('clusters matches that sit close together into rounds', () => {
    expect(groupMatchweeks(matches).map((week) => week.matches.map((m) => m.id))).toEqual([['a'], ['b'], ['c', 'd'], ['e']])
  })

  it('opens the round in progress, or the last one once the season is done', () => {
    const weeks = groupMatchweeks(matches)
    expect(currentMatchweekIndex(weeks, Date.parse('2026-09-28T12:00:00Z'))).toBe(2)
    const finished = groupMatchweeks(matches.map((m) => ({ ...m, status: 'FINISHED' as const })))
    expect(currentMatchweekIndex(finished, Date.parse('2026-11-01T12:00:00Z'))).toBe(3)
  })
})
