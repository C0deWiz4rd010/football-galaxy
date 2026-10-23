import type { MessageKey } from '@/i18n/de'
import type { Player } from '@/services/types'

export type PositionCode = Player['position']

export const POSITION_ORDER: PositionCode[] = ['GK', 'DF', 'MF', 'FW']

/** "Goalkeeper" — a single player's role. */
export const positionLabelKey: Record<PositionCode, MessageKey> = { GK: 'posGK', DF: 'posDF', MF: 'posMF', FW: 'posFW' }

/** "GK" — compact table cells. */
export const positionShortKey: Record<PositionCode, MessageKey> = { GK: 'posGKShort', DF: 'posDFShort', MF: 'posMFShort', FW: 'posFWShort' }

/** "Goalkeepers" — a squad section. */
export const positionGroupKey: Record<PositionCode, MessageKey> = { GK: 'posGroupGK', DF: 'posGroupDF', MF: 'posGroupMF', FW: 'posGroupFW' }

/**
 * Free-text provider positions ("Centre-Back", "Defensive Midfield",
 * "Offence", "G") into the four lines. `undefined` when it can't be told.
 */
export function positionBucket(raw: string | undefined): PositionCode | undefined {
  const value = raw?.trim().toLowerCase()
  if (!value) return undefined
  if (value === 'g' || value === 'gk' || value.includes('goal')) return 'GK'
  if (value === 'm' || value === 'mf' || value.includes('mid')) return 'MF'
  if (value === 'd' || value === 'df' || value.includes('def') || value.includes('back')) return 'DF'
  if (['f', 'fw', 'a'].includes(value) || /forward|offen|attack|striker|wing/.test(value)) return 'FW'
  return undefined
}
