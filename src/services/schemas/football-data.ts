import { z } from 'zod'

export const footballDataStandingsResponseSchema = z.object({
  standings: z.array(
    z.object({
      type: z.string(),
      table: z.array(
        z.object({
          position: z.number().int().positive(),
          team: z.object({
            id: z.number().int().nonnegative(),
            name: z.string().min(1),
            shortName: z.string().min(1),
            tla: z.string().min(1),
            crest: z.url().nullable().optional(),
          }),
          playedGames: z.number().int().nonnegative(),
          won: z.number().int().nonnegative(),
          draw: z.number().int().nonnegative(),
          lost: z.number().int().nonnegative(),
          goalsFor: z.number().int().nonnegative(),
          goalsAgainst: z.number().int().nonnegative(),
          goalDifference: z.number().int(),
          points: z.number().int().nonnegative(),
        }),
      ),
    }),
  ),
  competition: z.object({
    code: z.string().min(1),
    name: z.string().min(1),
  }),
  season: z.object({
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    currentMatchday: z.number().int().positive().nullable().optional(),
  }),
})

export type FootballDataStandingsResponse = z.infer<
  typeof footballDataStandingsResponseSchema
>
