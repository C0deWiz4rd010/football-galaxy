import { describe, expect, it } from 'vitest'

import { makeTeam } from '@/test/fixtures'
import type { Standing } from '@/services/types'

import { standingsIssues } from './dataInvariants'

function row(position: number, won: number, drawn: number, lost: number, goalsFor: number, goalsAgainst: number): Standing {
  const team = makeTeam(position)
  return {
    id: `${team.id}-standing`,
    leagueId: 'bundesliga',
    position,
    team,
    played: won + drawn + lost,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: won * 3 + drawn,
    form: [],
  }
}

/** 18 clubs, one round played: nine 1:0 home wins. */
const consistent = Array.from({ length: 18 }, (_, index) => (index < 9 ? row(index + 1, 1, 0, 0, 1, 0) : row(index + 1, 0, 0, 1, 0, 1)))

describe('standingsIssues', () => {
  it('accepts a consistent table', () => {
    expect(standingsIssues('bundesliga', consistent)).toEqual([])
  })

  it('reports broken arithmetic and a wrong team count', () => {
    const broken = consistent.slice(0, 17).map((entry, index) => (index === 0 ? { ...entry, points: 4 } : entry))
    const issues = standingsIssues('bundesliga', broken)

    expect(issues).toContain('17 teams, expected 18')
    expect(issues.some((issue) => issue.includes('pts ≠'))).toBe(true)
    expect(issues).toContain('total wins ≠ total losses')
  })
})
