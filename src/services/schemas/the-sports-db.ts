import { z } from 'zod'

export const theSportsDbStandingsResponseSchema = z.object({
  table: z
    .array(
      z.object({
        idStanding: z.string().min(1),
        intRank: z.coerce.number().int().positive(),
        idTeam: z.coerce.number().int().nonnegative(),
        strTeam: z.string().min(1),
        strBadge: z.url().nullable().optional(),
        idLeague: z.string().min(1),
        strLeague: z.string().min(1),
        strSeason: z.string().min(1),
        strForm: z.string().nullable().optional(),
        strDescription: z.string().nullable().optional(),
        intPlayed: z.coerce.number().int().nonnegative(),
        intWin: z.coerce.number().int().nonnegative(),
        intLoss: z.coerce.number().int().nonnegative(),
        intDraw: z.coerce.number().int().nonnegative(),
        intGoalsFor: z.coerce.number().int().nonnegative(),
        intGoalsAgainst: z.coerce.number().int().nonnegative(),
        intGoalDifference: z.coerce.number().int(),
        intPoints: z.coerce.number().int().nonnegative(),
        dateUpdated: z.string().min(1).optional(),
      }),
    )
    .nullable()
    .transform((table) => table ?? []),
})

export type TheSportsDbStandingsResponse = z.infer<
  typeof theSportsDbStandingsResponseSchema
>
