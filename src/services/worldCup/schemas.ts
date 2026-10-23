/**
 * Lenient Zod schemas for the football-data.org v4 World Cup endpoints.
 *
 * Only the fields the mapper reads are declared; unknown fields are stripped
 * and nullable values stay nullable, so an upstream shape change surfaces as a
 * parse error in the query instead of `undefined` deep inside a component.
 */
import { z } from 'zod'

const str = z.string().nullish()
const num = z.number().nullish()

export const fdTeamRefSchema = z.object({
  id: num,
  name: str,
  shortName: str,
  tla: str,
  crest: str,
})
export type FdTeamRef = z.infer<typeof fdTeamRefSchema>

const fdScoreHalfSchema = z.object({ home: num, away: num })
export type FdScoreHalf = z.infer<typeof fdScoreHalfSchema>

export const fdScoreSchema = z.object({
  winner: str,
  duration: str,
  fullTime: fdScoreHalfSchema.nullish(),
  halfTime: fdScoreHalfSchema.nullish(),
  regularTime: fdScoreHalfSchema.nullish(),
  extraTime: fdScoreHalfSchema.nullish(),
  penalties: fdScoreHalfSchema.nullish(),
})
export type FdScore = z.infer<typeof fdScoreSchema>

export const fdMatchSchema = z.object({
  id: z.number(),
  utcDate: z.string(),
  status: z.string(),
  stage: z.string(),
  group: str,
  venue: str,
  lastUpdated: str,
  homeTeam: fdTeamRefSchema,
  awayTeam: fdTeamRefSchema,
  score: fdScoreSchema.nullish(),
  referees: z.array(z.object({ name: str, type: str })).nullish(),
})
export type FdMatch = z.infer<typeof fdMatchSchema>

export const fdMatchesResponseSchema = z.object({ matches: z.array(fdMatchSchema).nullish() })

const fdStandingRowSchema = z.object({
  position: z.number(),
  team: fdTeamRefSchema,
  playedGames: z.number(),
  won: z.number(),
  draw: z.number(),
  lost: z.number(),
  points: z.number(),
  goalsFor: z.number(),
  goalsAgainst: z.number(),
  goalDifference: z.number(),
  form: str,
})
export type FdStandingRow = z.infer<typeof fdStandingRowSchema>

export const fdStandingsResponseSchema = z.object({
  standings: z
    .array(z.object({ stage: str, type: str, group: str, table: z.array(fdStandingRowSchema).nullish() }))
    .nullish(),
})

export const fdTeamsResponseSchema = z.object({ teams: z.array(fdTeamRefSchema).nullish() })

const fdSquadPlayerSchema = z.object({
  id: z.number(),
  name: str,
  position: str,
  dateOfBirth: str,
  shirtNumber: num,
})
export type FdSquadPlayer = z.infer<typeof fdSquadPlayerSchema>

export const fdTeamDetailSchema = fdTeamRefSchema.extend({
  coach: z.object({ name: str }).nullish(),
  squad: z.array(fdSquadPlayerSchema).nullish(),
})
