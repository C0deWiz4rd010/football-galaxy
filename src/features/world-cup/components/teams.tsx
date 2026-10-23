/** National teams: cards, filters, profile, squad. */
import { ChevronRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { POSITION_ORDER, positionBucket, positionGroupKey, type PositionCode } from '@/lib/positions'
import { cn } from '@/lib/utils'
import type { WorldCupSquadPlayer, WorldCupTeam } from '@/services/worldCup/types'

import { SquadPositionChart } from '../charts'
import { useWorldCupLabels } from '../labels'
import { uniqueOptions } from '../utils'
import { TeamFlag } from './shared'

export function WorldCupTeamCard({ team }: { team: WorldCupTeam }) {
  const wc = useWorldCupLabels()
  return (
    <Link to={`/world-cup-2026/team/${team.id}`} className="interactive-card stat-card rounded-lg p-3 hover:bg-background/60">
      <div className="flex items-center gap-3">
        <TeamFlag team={team} className="h-9 w-12" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{wc.team(team)}</p>
          <p className="text-xs text-muted-foreground">
            {wc.group(team.group)} · <span className="font-mono">{team.code}</span>
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
    </Link>
  )
}

export function WorldCupTeamFilters({
  onSearchChange,
  search,
}: {
  onSearchChange: (search: string) => void
  search: string
}) {
  const { t } = useLocale()
  return (
    <div className="stat-card rounded-xl p-3">
      <label className="flex min-h-11 items-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 text-sm focus-within:ring-2 focus-within:ring-ring">
        <Search className="size-4 text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('wcSearchTeams')}</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('wcSearchTeams')}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
      </label>
    </div>
  )
}

export function WorldCupTeamGroupRail({
  activeGroup,
  onSelectGroup,
  teams,
}: {
  activeGroup: string
  onSelectGroup: (group: string) => void
  teams: WorldCupTeam[]
}) {
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  const grouped = teams.reduce<Record<string, number>>((acc, team) => {
    if (team.group) acc[team.group] = (acc[team.group] ?? 0) + 1
    return acc
  }, {})
  const groups = uniqueOptions(Object.keys(grouped))
  const chip = (active: boolean) =>
    cn(
      'min-h-11 min-w-max rounded-md border border-border/50 px-3 py-1.5 text-left text-xs transition hover:bg-foreground/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      active && 'border-primary/60 bg-primary text-primary-foreground hover:bg-primary',
    )

  return (
    <div className="flex gap-2 overflow-x-auto rounded-xl border border-border/50 bg-background/30 p-2" role="group" aria-label={t('wcGroup')}>
      <button type="button" aria-pressed={activeGroup === 'all'} onClick={() => onSelectGroup('all')} className={chip(activeGroup === 'all')}>
        <span className="block font-semibold">{t('allOption')}</span>
        <span className="font-mono opacity-75">{teams.length}</span>
      </button>
      {groups.map((group) => (
        <button
          key={group}
          type="button"
          aria-pressed={activeGroup === group}
          onClick={() => onSelectGroup(group)}
          className={chip(activeGroup === group)}
        >
          <span className="block font-semibold">{wc.group(group)}</span>
          <span className="font-mono opacity-75">{grouped[group]}</span>
        </button>
      ))}
    </div>
  )
}

export function WorldCupTeamProfile({ team, playersCount }: { playersCount: number; team: WorldCupTeam }) {
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  return (
    <section className="stat-card app-grid-lines rounded-xl p-5">
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <TeamFlag team={team} className="h-16 w-24 shadow-fg-2" />
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight">{wc.team(team)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono">{team.code}</span> · {wc.group(team.group)}
            </p>
          </div>
        </div>
        <dl className="grid min-w-[220px] gap-2 text-sm">
          <ProfileLine label={t('wcCoach')} value={team.coach ?? t('notAnnounced')} />
          <ProfileLine label={t('squad')} value={t('playersCount', { count: playersCount })} />
          <ProfileLine label={t('statusLabel')} value={team.placeholder ? t('wcQualificationPending') : t('wcConfirmed')} />
        </dl>
      </div>
    </section>
  )
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft flex items-center justify-between gap-3 rounded-md px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-right text-sm font-medium">{value}</dd>
    </div>
  )
}

export function WorldCupSquadByPosition({ players }: { players: WorldCupSquadPlayer[] }) {
  const { t } = useLocale()
  const grouped = new Map<PositionCode | 'other', WorldCupSquadPlayer[]>()
  for (const player of players) {
    const bucket = positionBucket(player.position) ?? 'other'
    grouped.set(bucket, [...(grouped.get(bucket) ?? []), player])
  }
  const sections = [...POSITION_ORDER, 'other' as const].flatMap((bucket) => {
    const members = grouped.get(bucket)
    return members?.length ? [{ bucket, members }] : []
  })

  return (
    <section className="stat-card rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{t('wcSquadByPosition')}</h2>
        <Badge variant="outline">{t('playersCount', { count: players.length })}</Badge>
      </div>
      {players.length ? (
        <>
          <div className="surface-soft mb-3 rounded-md p-3">
            <p className="mb-1 text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcComposition')}</p>
            <SquadPositionChart players={players} />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {sections.map(({ bucket, members }) => (
              <div key={bucket} className="surface-soft rounded-md p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{bucket === 'other' ? t('posUnknown') : t(positionGroupKey[bucket])}</h3>
                  <span className="font-mono text-xs text-muted-foreground">{members.length}</span>
                </div>
                <ul className="grid gap-2">
                  {members.map((player) => (
                    <li key={player.id} className="flex items-center gap-3 rounded-lg px-1 py-1">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/10 font-mono text-xs">
                        {player.number ?? '–'}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{player.name}</span>
                      {player.age ? <span className="shrink-0 text-xs text-muted-foreground">{t('wcAgeShort', { age: player.age })}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-md border border-dashed border-border/70 p-4 text-sm text-muted-foreground">{t('wcSquadNotPublished')}</p>
      )}
    </section>
  )
}
