import { z } from 'zod'

import { leagueIdSchema } from '../config/leagues'

export const standingTeamSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().min(1),
  shortName: z.string().min(1),
  tla: z.string().min(1),
  crestUrl: z.url().nullable(),
})

export const standingRowSchema = z.object({
  position: z.number().int().positive(),
  team: standingTeamSchema,
  played: z.number().int().nonnegative(),
  won: z.number().int().nonnegative(),
  draw: z.number().int().nonnegative(),
  lost: z.number().int().nonnegative(),
  goalsFor: z.number().int().nonnegative(),
  goalsAgainst: z.number().int().nonnegative(),
  goalDifference: z.number().int(),
  points: z.number().int().nonnegative(),
})

export const leagueStandingsSchema = z.object({
  leagueId: leagueIdSchema,
  leagueLabel: z.string().min(1),
  season: z.object({
    label: z.string().min(1),
    currentMatchday: z.number().int().positive().nullable(),
  }),
  source: z.literal('the-sports-db'),
  standings: z.array(standingRowSchema),
})

export type StandingTeam = z.infer<typeof standingTeamSchema>
export type StandingRow = z.infer<typeof standingRowSchema>
export type LeagueStandings = z.infer<typeof leagueStandingsSchema>
