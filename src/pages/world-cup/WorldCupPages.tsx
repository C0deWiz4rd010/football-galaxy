import { useMemo, useState } from 'react'

import { CalendarDays, Goal, Shield, Trophy, Users } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { NotFoundState } from '@/components/shared/StatusStates'
import { useLocale } from '@/contexts/LocaleContext'
import {
  useWorldCupBracket,
  useWorldCupDashboard,
  useWorldCupFixture,
  useWorldCupFixtures,
  useWorldCupGroups,
  useWorldCupTeam,
  useWorldCupTeams,
} from '@/hooks/queries/worldCup'
import { isNotFoundError } from '@/services/errors'
import {
  MatchMetaGrid,
  TeamScore,
  WorldCupBracketPreview,
  WorldCupDataStatus,
  WorldCupEmptyState,
  WorldCupError,
  WorldCupFeatureMatch,
  WorldCupGroupsPreview,
  WorldCupGroupTable,
  WorldCupHero,
  WorldCupHostCityPanel,
  WorldCupLoading,
  WorldCupMatchCard,
  WorldCupMatchFilters,
  WorldCupPageTitle,
  WorldCupScoreBreakdown,
  WorldCupSectionNav,
  WorldCupShell,
  WorldCupSquadByPosition,
  WorldCupTeamCard,
  WorldCupTeamFilters,
  WorldCupTeamGroupRail,
  WorldCupTeamProfile,
  WorldCupTeamSpotlight,
  WorldCupTournamentStatus,
  WorldCupUpcomingCard,
} from '@/features/world-cup/components'
import {
  defaultWorldCupFilters,
  filterWorldCupFixtures,
  groupWorldCupStandings,
} from '@/features/world-cup/utils'
import { useWorldCupLabels } from '@/features/world-cup/labels'
import { WorldCupBracketBoard } from '@/features/world-cup/BracketBoard'
import { MatchStatsChart } from '@/features/world-cup/charts'
import { formatDateTime } from '@/lib/utils'
import type {
  WorldCupFilterState,
  WorldCupFixture,
  WorldCupLineup,
} from '@/services/worldCup/types'

export function WorldCupOverviewPage() {
  const { t } = useLocale()
  const { data, error, isPending: isLoading, refetch } = useWorldCupDashboard()
  const grouped = useMemo(() => groupWorldCupStandings(data?.groups ?? []), [data?.groups])
  const spotlightStanding = useMemo(() => {
    const leaders = (data?.groups ?? []).filter((row) => row.rank === 1)
    return [...leaders].sort(
      (left, right) => right.points - left.points || right.goalDifference - left.goalDifference,
    )[0]
  }, [data?.groups])

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError onRetry={() => void refetch()} />
  if (!data) return null

  const featuredMatch = data.liveMatches[0] ?? data.upcomingMatches[0] ?? data.recentMatches[0]
  const upcomingList = [...data.liveMatches, ...data.upcomingMatches].filter(
    (fixture) => fixture.id !== featuredMatch?.id,
  )
  // Finished tournament: show the latest results instead of an empty schedule.
  const scheduleMode = upcomingList.length ? 'upcoming' : 'recent'
  const scheduleList = upcomingList.length ? upcomingList : data.recentMatches.filter((fixture) => fixture.id !== featuredMatch?.id)

  return (
    <WorldCupShell>
      <WorldCupHero
        endsAt={data.tournament.endsAt}
        hostCitiesCount={data.tournament.hostCities.length}
        hostCountries={data.tournament.hostCountries}
        liveCount={data.liveMatches.length}
        quality={data.quality}
        startsAt={data.tournament.startsAt}
      />
      <WorldCupSectionNav />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.15fr_0.95fr_0.9fr]">
        <WorldCupFeatureMatch fixture={featuredMatch} />
        <WorldCupUpcomingCard fixtures={scheduleList} mode={scheduleMode} />
        <WorldCupTournamentStatus
          endsAt={data.tournament.endsAt}
          hostCitiesCount={data.tournament.hostCities.length}
          hostCountries={data.tournament.hostCountries}
          liveCount={data.liveMatches.length}
          matchesCount={data.tournament.matchCount}
          recentCount={data.recentMatches.length}
          startsAt={data.tournament.startsAt}
          teamsCount={data.tournament.teamCount}
          upcomingCount={data.upcomingMatches.length}
        />
      </div>

      <WorldCupGroupsPreview grouped={grouped} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.25fr_0.9fr_0.85fr]">
        <WorldCupBracketPreview rounds={data.bracket} />
        <WorldCupHostCityPanel cities={data.tournament.hostCities} />
        <WorldCupTeamSpotlight standing={spotlightStanding} team={data.teams[0]} />
      </div>

      <section className="stat-card rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcNationalTeams')}</p>
            <h2 className="text-base font-semibold tracking-tight">{t('wcInTournament')}</h2>
          </div>
          <Badge variant="outline">{data.teams.length}</Badge>
        </div>
        {data.teams.length ? (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {data.teams.slice(0, 8).map((team) => (
              <WorldCupTeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            {t('wcTeamsPending')}
          </p>
        )}
      </section>
    </WorldCupShell>
  )
}

export function WorldCupMatchesPage() {
  const { t } = useLocale()
  const { data, error, isPending: isLoading, refetch } = useWorldCupFixtures()
  const [filters, setFilters] = useState<WorldCupFilterState>(defaultWorldCupFilters)
  const filtered = useMemo(() => filterWorldCupFixtures(data ?? [], filters), [data, filters])

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError onRetry={() => void refetch()} />

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description={t('wcMatchesDescription')}
        icon={<CalendarDays className="size-5" />}
        title={t('wcMatchesTitle')}
      />
      <WorldCupSectionNav />
      <WorldCupMatchFilters filters={filters} fixtures={data ?? []} onChange={setFilters} />
      <p className="text-sm text-muted-foreground">
        {t('wcShowingMatches', { shown: filtered.length, total: data?.length ?? 0 })}
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((fixture) => (
          <WorldCupMatchCard key={fixture.id} fixture={fixture} />
        ))}
      </div>
      {!filtered.length ? (
        <WorldCupEmptyState
          actionLabel={data?.length ? t('wcResetFilters') : undefined}
          description={data?.length ? t('wcNoMatchesFilteredBody') : t('wcNoMatchesBody')}
          onAction={data?.length ? () => setFilters(defaultWorldCupFilters) : undefined}
          title={data?.length ? t('wcNoMatchesFilteredTitle') : t('wcNoMatchesTitle')}
        />
      ) : null}
    </WorldCupShell>
  )
}

export function WorldCupGroupsPage() {
  const { t } = useLocale()
  const { data, error, isPending: isLoading, refetch } = useWorldCupGroups()
  const grouped = useMemo(() => groupWorldCupStandings(data ?? []), [data])

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError onRetry={() => void refetch()} />

  const groupEntries = Object.entries(grouped)

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description={t('wcGroupsDescription')}
        icon={<Shield className="size-5" />}
        title={t('wcGroupsTitle')}
      />
      <WorldCupSectionNav />
      <section className="stat-card rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcQualification')}</p>
            <h2 className="text-base font-semibold tracking-tight">{t('wcQualificationRule')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-info/30 text-info-fg">1. / 2.</Badge>
            <Badge variant="outline" className="border-warning/30 text-warning-fg">{t('wcBestThird')}</Badge>
          </div>
        </div>
      </section>
      {groupEntries.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groupEntries.map(([group, rows]) => (
            <WorldCupGroupTable key={group} group={group} rows={rows} />
          ))}
        </div>
      ) : (
        <WorldCupEmptyState
          description={t('wcGroupsPending')}
          title={t('wcStandingsPendingTitle')}
        />
      )}
    </WorldCupShell>
  )
}

export function WorldCupBracketPage() {
  const { t } = useLocale()
  const { data, error, isPending: isLoading, refetch } = useWorldCupBracket()

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError onRetry={() => void refetch()} />

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description={t('wcBracketDescription')}
        icon={<Trophy className="size-5" />}
        title={t('wcBracketTitle')}
      />
      <WorldCupSectionNav />
      <WorldCupBracketBoard rounds={data ?? []} />
    </WorldCupShell>
  )
}

export function WorldCupTeamsPage() {
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  const { data, error, isPending: isLoading, refetch } = useWorldCupTeams()
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('all')
  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (data ?? []).filter((team) => {
      const matchesSearch =
        !query ||
        team.name.toLowerCase().includes(query) ||
        wc.team(team).toLowerCase().includes(query) ||
        team.code.toLowerCase().includes(query) ||
        team.country.toLowerCase().includes(query) ||
        (team.group ?? '').toLowerCase().includes(query)
      const matchesGroup = group === 'all' || team.group === group

      return matchesSearch && matchesGroup
    })
  }, [data, group, search, wc])

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError onRetry={() => void refetch()} />

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description={t('wcTeamsDescription')}
        icon={<Users className="size-5" />}
        title={t('wcTeamsTitle')}
      />
      <WorldCupSectionNav />
      <WorldCupTeamFilters onSearchChange={setSearch} search={search} />
      <WorldCupTeamGroupRail activeGroup={group} onSelectGroup={setGroup} teams={data ?? []} />
      <p className="text-sm text-muted-foreground">
        {t('wcShowingTeams', { shown: filteredTeams.length, total: data?.length ?? 0 })}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filteredTeams.map((team) => (
          <WorldCupTeamCard key={team.id} team={team} />
        ))}
      </div>
      {!filteredTeams.length ? (
        <WorldCupEmptyState
          actionLabel={data?.length ? t('wcResetFilters') : undefined}
          description={data?.length ? t('wcNoTeamsFilteredBody') : t('wcNoTeamsBody')}
          onAction={
            data?.length
              ? () => {
                  setSearch('')
                  setGroup('all')
                }
              : undefined
          }
          title={data?.length ? t('wcNoTeamsFilteredTitle') : t('wcNoTeamsTitle')}
        />
      ) : null}
    </WorldCupShell>
  )
}

export function WorldCupMatchDetailPage() {
  const { matchId } = useParams()
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  const { data, error, isPending: isLoading, refetch } = useWorldCupFixture(matchId)

  if (isNotFoundError(error)) return <NotFoundState backTo="/world-cup-2026/matches" />

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError onRetry={() => void refetch()} />
  if (!data) return null

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description={[wc.round(data), formatDateTime(data.utcDate)].join(' · ')}
        icon={<Goal className="size-5" />}
        quality={data.quality}
        title={`${wc.team(data.homeTeam)} – ${wc.team(data.awayTeam)}`}
      />
      <WorldCupSectionNav />
      <section className="stat-card rounded-xl p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <TeamScore team={data.homeTeam} align="left" />
          <div className="flex flex-col items-center justify-center">
            <Badge variant={data.status === 'LIVE' ? 'soft' : 'outline'}>
              {data.status === 'LIVE' ? `${data.elapsed ?? 0}'` : wc.status(data.status)}
            </Badge>
            <p className="mt-2 font-mono text-4xl font-bold">{data.homeScore ?? '–'}:{data.awayScore ?? '–'}</p>
          </div>
          <TeamScore team={data.awayTeam} align="right" />
        </div>
      </section>
      <MatchMetaGrid fixture={data} />
      <WorldCupScoreBreakdown fixture={data} />
      {hasMatchDetails(data) ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Timeline fixture={data} />
          <aside className="flex flex-col gap-4">
            <StatisticsPanel fixture={data} />
            <LineupsPanel lineups={data.lineups ?? []} />
          </aside>
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
          {t('wcNoMatchDetails')}
        </p>
      )}
    </WorldCupShell>
  )
}

export function WorldCupTeamDetailPage() {
  const { teamId } = useParams()
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  const { data, error, isPending: isLoading, refetch } = useWorldCupTeam(teamId)

  if (isNotFoundError(error)) return <NotFoundState backTo="/world-cup-2026/teams" />

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError onRetry={() => void refetch()} />
  if (!data) return null

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description={t('wcTeamDescription', { group: wc.group(data.team.group) })}
        icon={<Shield className="size-5" />}
        quality={data.squad.quality}
        title={data.team.placeholder ? t('wcQualificationPending') : wc.team(data.team)}
      />
      <WorldCupSectionNav />
      <WorldCupTeamProfile team={data.team} playersCount={data.squad.players.length} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <WorldCupSquadByPosition players={data.squad.players.slice(0, 30)} />
        <aside className="flex flex-col gap-3">
          <WorldCupDataStatus quality={data.squad.quality} />
          <section className="stat-card rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">{t('wcTeamFixtures')}</h2>
              <Badge variant="outline">{data.fixtures.length}</Badge>
            </div>
            <div className="grid gap-2">
              {data.fixtures.map((fixture) => (
                <WorldCupMatchCard key={fixture.id} fixture={fixture} compact />
              ))}
            </div>
            {!data.fixtures.length ? (
              <p className="rounded-md border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                {t('wcTeamFixturesEmpty')}
              </p>
            ) : null}
          </section>
        </aside>
      </div>
    </WorldCupShell>
  )
}

function hasMatchDetails(fixture: WorldCupFixture) {
  return fixture.events.length > 0 || (fixture.statistics?.length ?? 0) > 0 || (fixture.lineups?.length ?? 0) > 0
}

function Timeline({ fixture }: { fixture: WorldCupFixture }) {
  const { t } = useLocale()
  if (!fixture.events.length) return null
  return (
    <section className="stat-card rounded-xl p-4">
      <h2 className="text-base font-semibold">{t('wcTimeline')}</h2>
      <div className="mt-3 flex flex-col gap-2">
        {fixture.events.map((event) => (
          <div key={event.id} className="surface-soft flex items-center gap-3 rounded-md p-2.5 text-sm">
            <span className="font-mono text-xs text-muted-foreground">{event.minute}'</span>
            <span className="font-medium">{event.detail}</span>
            <span className="text-muted-foreground">{event.playerName ?? event.teamName ?? t('wcEvent')}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function StatisticsPanel({ fixture }: { fixture: WorldCupFixture }) {
  const { t } = useLocale()
  const statistics = fixture.statistics ?? []
  if (!statistics.length) return null
  return (
    <section className="stat-card rounded-xl p-4">
      <h2 className="text-base font-semibold">{t('wcMatchStats')}</h2>
      <div className="mt-3">
        <MatchStatsChart
          awayName={fixture.awayTeam.code || fixture.awayTeam.name}
          awayTeamId={fixture.awayTeam.id}
          homeName={fixture.homeTeam.code || fixture.homeTeam.name}
          homeTeamId={fixture.homeTeam.id}
          statistics={statistics}
        />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {statistics.slice(0, 12).map((stat) => (
          <div
            key={`${stat.teamId}-${stat.type}`}
            className="surface-soft flex items-center justify-between gap-3 rounded-md p-2 text-sm"
          >
            <span className="truncate text-muted-foreground">{stat.teamName} · {stat.type}</span>
            <span className="font-mono font-bold">{stat.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function LineupsPanel({ lineups }: { lineups: WorldCupLineup[] }) {
  const { t } = useLocale()
  if (!lineups.length) return null
  return (
    <section className="stat-card rounded-xl p-4">
      <h2 className="text-base font-semibold">{t('wcLineups')}</h2>
      <div className="mt-3 flex flex-col gap-3">
        {lineups.map((lineup) => (
          <div key={lineup.teamId} className="surface-soft rounded-md p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">{lineup.teamName}</h3>
              <Badge variant="outline">{lineup.formation ?? t('wcFormationPending')}</Badge>
            </div>
            <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
              {lineup.starters.slice(0, 6).map((player) => (
                <span key={player.id}>{[player.number ?? '–', player.name, player.position].filter(Boolean).join(' · ')}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
