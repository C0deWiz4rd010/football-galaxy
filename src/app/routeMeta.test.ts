import { describe, expect, it } from 'vitest'

import { de } from '@/i18n/de'

import { routeMeta } from './routeMeta'

const t = (key: keyof typeof de, vars?: Record<string, string | number>) =>
  de[key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars?.[name] ?? `{${name}}`))

describe('routeMeta', () => {
  it('names league pages and fills the league into the description', () => {
    const meta = routeMeta('/bundesliga', t)
    expect(meta).toMatchObject({ title: 'Bundesliga', subtitle: 'Football Galaxy / Bundesliga', leagueId: 'bundesliga' })
    expect(meta.description).toContain('Bundesliga')
  })

  it('distinguishes team, coach and player pages below a league', () => {
    expect(routeMeta('/serie-a/team/103', t).title).toBe(de.teamDetailTitle)
    expect(routeMeta('/serie-a/team/103/coach', t).title).toBe(de.coachDetailTitle)
    expect(routeMeta('/serie-a/player/espn-1', t).title).toBe(de.playerDetailTitle)
  })

  it('maps top-level sections, including nested World Cup routes', () => {
    expect(routeMeta('/live', t).title).toBe(de.liveScores)
    expect(routeMeta('/live', t).leagueId).toBeUndefined()
    expect(routeMeta('/world-cup-2026/bracket', t).title).toBe(de.worldCup2026)
  })
})
