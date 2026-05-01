import { z } from 'zod'

const theSportsDbEventSchema = z.object({
  idEvent: z.string().min(1),
  idLeague: z.string().min(1),
  strLeague: z.string().min(1),
  strSeason: z.string().min(1),
  strHomeTeam: z.string().min(1),
  strAwayTeam: z.string().min(1),
  idHomeTeam: z.coerce.number().int().nonnegative(),
  idAwayTeam: z.coerce.number().int().nonnegative(),
  strHomeTeamBadge: z.url().nullable().optional(),
  strAwayTeamBadge: z.url().nullable().optional(),
  intHomeScore: z.coerce.number().int().nullable(),
  intAwayScore: z.coerce.number().int().nullable(),
  intRound: z.coerce.number().int().positive().nullable(),
  dateEvent: z.string().min(1).nullable().optional(),
  strStatus: z.string().nullable().optional(),
  strPostponed: z.string().nullable().optional(),
})

export const theSportsDbSeasonEventsResponseSchema = z.object({
  events: z.array(theSportsDbEventSchema).nullable().transform((events) => events ?? []),
})

export type TheSportsDbEvent = z.infer<typeof theSportsDbEventSchema>
export type TheSportsDbSeasonEventsResponse = z.infer<
  typeof theSportsDbSeasonEventsResponseSchema
>
