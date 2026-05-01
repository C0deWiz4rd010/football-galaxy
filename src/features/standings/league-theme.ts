import type { CSSProperties } from 'react'

import type { LeagueId } from '../../services'

const leagueThemes: Record<
  LeagueId,
  {
    accent: string
    accentStrong: string
    accentSoft: string
    accentGlow: string
  }
> = {
  'premier-league': {
    accent: '#7e6bff',
    accentStrong: '#a45fff',
    accentSoft: 'rgba(126, 107, 255, 0.18)',
    accentGlow: 'rgba(164, 95, 255, 0.28)',
  },
  'la-liga': {
    accent: '#ff8d5c',
    accentStrong: '#ff5a5a',
    accentSoft: 'rgba(255, 141, 92, 0.18)',
    accentGlow: 'rgba(255, 90, 90, 0.28)',
  },
  bundesliga: {
    accent: '#ff6b6b',
    accentStrong: '#ff3d57',
    accentSoft: 'rgba(255, 107, 107, 0.18)',
    accentGlow: 'rgba(255, 61, 87, 0.28)',
  },
  'serie-a': {
    accent: '#5dc2ff',
    accentStrong: '#2d88ff',
    accentSoft: 'rgba(93, 194, 255, 0.18)',
    accentGlow: 'rgba(45, 136, 255, 0.28)',
  },
  'ligue-1': {
    accent: '#f6bf6d',
    accentStrong: '#f39b36',
    accentSoft: 'rgba(246, 191, 109, 0.18)',
    accentGlow: 'rgba(243, 155, 54, 0.28)',
  },
}

export function getLeagueTheme(leagueId: LeagueId) {
  const theme = leagueThemes[leagueId]

  return {
    style: {
      '--league-accent': theme.accent,
      '--league-accent-strong': theme.accentStrong,
      '--league-accent-soft': theme.accentSoft,
      '--league-accent-glow': theme.accentGlow,
    } as CSSProperties,
  }
}
