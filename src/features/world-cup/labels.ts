import { useMemo } from 'react'

import { type MessageKey, useLocale } from '@/contexts/LocaleContext'
import { nationName } from '@/lib/countries'
import { formatDate } from '@/lib/utils'
import type {
  WorldCupBracketMatch,
  WorldCupFixture,
  WorldCupMatchStatus,
  WorldCupStage,
  WorldCupTeam,
} from '@/services/worldCup/types'

const STAGE_KEY: Record<WorldCupStage, MessageKey> = {
  group: 'wcStageGroup',
  'round-of-32': 'wcStageRoundOf32',
  'round-of-16': 'wcStageRoundOf16',
  'quarter-final': 'wcStageQuarterFinal',
  'semi-final': 'wcStageSemiFinal',
  'third-place': 'wcStageThirdPlace',
  final: 'wcStageFinal',
  unknown: 'wcStageUnknown',
}

const STATUS_KEY: Record<WorldCupMatchStatus, MessageKey> = {
  LIVE: 'wcStateLive',
  SCHEDULED: 'wcStateUpcoming',
  FINISHED: 'wcStateFinished',
  POSTPONED: 'wcStatePostponed',
}

/**
 * Localized World Cup labels. The provider layer only delivers codes (stage,
 * status, FIFA team code); every visible word is produced here.
 */
export function useWorldCupLabels() {
  const { t, locale } = useLocale()
  return useMemo(() => {
    const team = (value?: WorldCupTeam) =>
      !value || value.placeholder ? t('wcTbd') : nationName(value.code, value.name, locale)
    const group = (letter?: string) => (letter ? t('wcGroupName', { group: letter }) : t('wcTbd'))
    const stage = (value: WorldCupStage) => t(STAGE_KEY[value])
    /** "a.e.t." / "3–4 pens" for knockouts not settled in 90 minutes. */
    const decision = (match: Pick<WorldCupBracketMatch, 'decidedBy' | 'penalties'>) => {
      if (match.decidedBy === 'penalties' && match.penalties) {
        return t('wcOnPenaltiesShort', { home: match.penalties.home ?? '–', away: match.penalties.away ?? '–' })
      }
      if (match.decidedBy === 'extra-time') return t('wcAfterExtraTimeShort')
      return undefined
    }
    return {
      team,
      group,
      stage,
      /** Group matches show their group ("Group C"), knockouts their round. */
      round: (fixture: WorldCupFixture) =>
        fixture.group && (fixture.stage === 'group' || fixture.stage === 'unknown') ? group(fixture.group) : stage(fixture.stage),
      decision,
      status: (status: WorldCupMatchStatus) => t(STATUS_KEY[status]),
      /** Compact badge: minute when live, "FT" when over, otherwise the date. */
      badge: (fixture: WorldCupFixture) => {
        if (fixture.status === 'LIVE') return `${fixture.elapsed ?? 0}'`
        if (fixture.status === 'FINISHED') return decision(fixture) ?? t('wcFullTimeShort')
        if (fixture.status === 'POSTPONED') return t('wcStatePostponed')
        return formatDate(fixture.utcDate)
      },
    }
  }, [t, locale])
}

export type WorldCupLabels = ReturnType<typeof useWorldCupLabels>
