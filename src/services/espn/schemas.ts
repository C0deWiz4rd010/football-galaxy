/**
 * Lenient Zod schemas for ESPN's public (keyless) soccer site API.
 *
 * Every field is optional and unknown fields are stripped: an upstream shape
 * change degrades to empty data or a thrown parse error the cascade can fall
 * past, never a runtime crash deep in a component.
 */
import { z } from 'zod'

const str = z.string().optional()
const num = z.number().optional()

export const logoSchema = z.object({ href: str, rel: z.array(z.string()).optional() })

export const teamSchema = z.object({
  id: str,
  displayName: str,
  shortDisplayName: str,
  name: str,
  abbreviation: str,
  color: str,
  alternateColor: str,
  logos: z.array(logoSchema).optional(),
  logo: str,
})
export type EspnTeam = z.infer<typeof teamSchema>

export const teamsResponseSchema = z.object({
  sports: z
    .array(
      z.object({
        leagues: z.array(z.object({ teams: z.array(z.object({ team: teamSchema.optional() })).optional() })).optional(),
      }),
    )
    .optional(),
})

const statSchema = z.object({ name: str, type: str, value: num, displayValue: str })

export const standingsResponseSchema = z.object({
  season: z.object({ year: num, displayName: str }).optional(),
  children: z
    .array(
      z.object({
        standings: z
          .object({ entries: z.array(z.object({ team: teamSchema.optional(), stats: z.array(statSchema).optional() })).optional() })
          .optional(),
      }),
    )
    .optional(),
})
export type EspnStandingEntry = NonNullable<
  NonNullable<NonNullable<z.infer<typeof standingsResponseSchema>['children']>[number]['standings']>['entries']
>[number]

/** ESPN reports scores as a number, a numeric string, or `{ value, displayValue }`. */
const scoreSchema = z.union([z.number(), z.string(), z.object({ value: num, displayValue: str })]).optional()

const competitorSchema = z.object({
  id: str,
  homeAway: str,
  score: scoreSchema,
  team: teamSchema.optional(),
})

const statusSchema = z.object({
  displayClock: str,
  type: z.object({ name: str, state: str, completed: z.boolean().optional(), shortDetail: str }).optional(),
})

export const eventSchema = z.object({
  id: str,
  date: str,
  name: str,
  week: z.object({ number: num }).optional(),
  status: statusSchema.optional(),
  competitions: z
    .array(
      z.object({
        venue: z.object({ fullName: str, displayName: str }).optional(),
        status: statusSchema.optional(),
        competitors: z.array(competitorSchema).optional(),
      }),
    )
    .optional(),
})
export type EspnEvent = z.infer<typeof eventSchema>

export const eventsResponseSchema = z.object({ events: z.array(eventSchema).optional() })

const leaderSchema = z.object({
  value: num,
  athlete: z
    .object({
      id: str,
      displayName: str,
      jersey: str,
      team: z.object({ id: str }).optional(),
      statistics: z.array(z.object({ name: str, value: num })).optional(),
    })
    .optional(),
})

export const statisticsResponseSchema = z.object({
  stats: z.array(z.object({ name: str, leaders: z.array(leaderSchema).optional() })).optional(),
})
export type EspnLeader = z.infer<typeof leaderSchema>

/** Roster athletes carry nested stat categories we read leniently. */
export const rosterResponseSchema = z.object({
  athletes: z.array(z.record(z.string(), z.unknown())).optional(),
})

export const athleteResponseSchema = z.object({
  athlete: z.object({ id: str, displayName: str, team: z.object({ id: str }).optional() }).optional(),
})
