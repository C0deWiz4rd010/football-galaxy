import { useMemo, useState } from 'react'

import { CalendarDays, Goal, Shield, Trophy, Users } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { useWorldCupData } from '@/hooks/useWorldCupData'
import {
  MatchMetaGrid,
  TeamScore,
  WorldCupBracketBoard,
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
import { MatchStatsChart } from '@/features/world-cup/charts'
import { formatDateTime } from '@/lib/utils'
import type {
  WorldCupBracketRound,
  WorldCupDashboard,
  WorldCupFilterState,
  WorldCupFixture,
  WorldCupGroupStanding,
  WorldCupLineup,
  WorldCupSquad,
  WorldCupTeam,
} from '@/services/worldCup/types'

export function WorldCupOverviewPage() {
  const { data, error, isLoading, refetch } = useWorldCupData<WorldCupDashboard>(
    'getDashboard',
    {},
    { refetchIntervalMs: 60_000 },
  )
  const grouped = useMemo(() => groupWorldCupStandings(data?.groups ?? []), [data?.groups])
  const spotlightStanding = useMemo(() => {
    const leaders = (data?.groups ?? []).filter((row) => row.rank === 1)
    return [...leaders].sort(
      (left, right) => right.points - left.points || right.goalDifference - left.goalDifference,
    )[0]
  }, [data?.groups])

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError error={error} onRetry={refetch} />
  if (!data) return null

  const featuredMatch = data.liveMatches[0] ?? data.upcomingMatches[0] ?? data.recentMatches[0]
  const upcomingList = [...data.liveMatches, ...data.upcomingMatches].filter(
    (fixture) => fixture.id !== featuredMatch?.id,
  )

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
        <WorldCupUpcomingCard fixtures={upcomingList} />
        <WorldCupTournamentStatus
          endsAt={data.tournament.endsAt}
          hostCitiesCount={data.tournament.hostCities.length}
          liveCount={data.liveMatches.length}
          matchesCount={data.tournament.matchCount}
          quality={data.quality}
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

      <section className="stat-card rounded-fg-xl p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">National teams</p>
            <h2 className="text-base font-semibold tracking-tight">In the tournament</h2>
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
          <p className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            Confirmed national teams will appear here as the live provider publishes the tournament field.
          </p>
        )}
      </section>
    </WorldCupShell>
  )
}

export function WorldCupMatchesPage() {
  const { data, error, isLoading, refetch } = useWorldCupData<WorldCupFixture[]>(
    'getFixtures',
    {},
    { refetchIntervalMs: 15_000 },
  )
  const [filters, setFilters] = useState<WorldCupFilterState>(defaultWorldCupFilters)
  const filtered = useMemo(() => filterWorldCupFixtures(data ?? [], filters), [data, filters])

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError error={error} onRetry={refetch} />

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description="Standalone tournament schedule with live, upcoming, and finished match states."
        icon={<CalendarDays className="size-5" />}
        title="World Cup 2026 Matches"
      />
      <WorldCupSectionNav />
      <WorldCupMatchFilters filters={filters} fixtures={data ?? []} onChange={setFilters} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          Showing <span className="font-mono font-bold text-foreground">{filtered.length}</span> of{' '}
          <span className="font-mono font-bold text-foreground">{data?.length ?? 0}</span> matches
        </p>
        <p>Live data refreshes every 15 seconds.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((fixture) => (
          <WorldCupMatchCard key={fixture.id} fixture={fixture} />
        ))}
      </div>
      {!filtered.length ? (
        <WorldCupEmptyState
          actionLabel={data?.length ? 'Reset filters' : undefined}
          description={
            data?.length
              ? 'Try a different team, city, round, or status to widen the match list.'
              : 'The live feed has not published any World Cup fixtures yet. They will appear here automatically.'
          }
          onAction={data?.length ? () => setFilters(defaultWorldCupFilters) : undefined}
          title={data?.length ? 'No matches match these filters' : 'No matches available yet'}
        />
      ) : null}
    </WorldCupShell>
  )
}

export function WorldCupGroupsPage() {
  const { data, error, isLoading, refetch } = useWorldCupData<WorldCupGroupStanding[]>(
    'getGroups',
    {},
    { refetchIntervalMs: 60_000 },
  )
  const grouped = useMemo(() => groupWorldCupStandings(data ?? []), [data])

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError error={error} onRetry={refetch} />

  const groupEntries = Object.entries(grouped)

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description="All 12 groups stay inside the World Cup area, separate from club league standings."
        icon={<Shield className="size-5" />}
        title="World Cup 2026 Groups"
      />
      <WorldCupSectionNav />
      <section className="stat-card rounded-fg-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Qualification logic</p>
            <h2 className="text-base font-semibold tracking-tight">Top two advance, third-place teams stay under watch</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-sky-300/30 text-sky-100">Top 2 zone</Badge>
            <Badge variant="outline" className="border-amber-300/30 text-amber-100">Best third-place watch</Badge>
            <Badge variant="outline">Pending</Badge>
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
          description="Group standings publish once the first group matches kick off. They will appear here automatically from the live feed."
          title="Standings are not published yet"
        />
      )}
    </WorldCupShell>
  )
}

export function WorldCupBracketPage() {
  const { data, error, isLoading, refetch } = useWorldCupData<WorldCupBracketRound[]>('getBracket', {}, {
    refetchIntervalMs: 60_000,
  })

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError error={error} onRetry={refetch} />

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description="The knockout board builds live from the group-stage results — no placeholder fixtures."
        icon={<Trophy className="size-5" />}
        title="World Cup 2026 Bracket"
      />
      <WorldCupSectionNav />
      <WorldCupBracketBoard rounds={data ?? []} />
    </WorldCupShell>
  )
}

export function WorldCupTeamsPage() {
  const { data, error, isLoading, refetch } = useWorldCupData<WorldCupTeam[]>('getTeams')
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('all')
  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (data ?? []).filter((team) => {
      const matchesSearch =
        !query ||
        team.name.toLowerCase().includes(query) ||
        team.code.toLowerCase().includes(query) ||
        team.country.toLowerCase().includes(query) ||
        (team.group ?? '').toLowerCase().includes(query)
      const matchesGroup = group === 'all' || team.group === group

      return matchesSearch && matchesGroup
    })
  }, [data, group, search])

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError error={error} onRetry={refetch} />

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description="National teams only. This route never links into club-team pages."
        icon={<Users className="size-5" />}
        title="World Cup 2026 Teams"
      />
      <WorldCupSectionNav />
      <WorldCupTeamFilters
        group={group}
        onGroupChange={setGroup}
        onSearchChange={setSearch}
        search={search}
        teams={data ?? []}
      />
      <WorldCupTeamGroupRail activeGroup={group} onSelectGroup={setGroup} teams={data ?? []} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          Showing <span className="font-mono font-bold text-foreground">{filteredTeams.length}</span> of{' '}
          <span className="font-mono font-bold text-foreground">{data?.length ?? 0}</span> teams
        </p>
        <p>Team links always stay inside the World Cup area.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filteredTeams.map((team) => (
          <WorldCupTeamCard key={team.id} team={team} />
        ))}
      </div>
      {!filteredTeams.length ? (
        <WorldCupEmptyState
          actionLabel={data?.length ? 'Reset team filters' : undefined}
          description={
            data?.length
              ? 'Try another country name, code, or group to find teams in the tournament list.'
              : 'The live provider has not published the World Cup team list yet. Teams will appear here automatically.'
          }
          onAction={
            data?.length
              ? () => {
                  setSearch('')
                  setGroup('all')
                }
              : undefined
          }
          title={data?.length ? 'No teams match these filters' : 'No teams available yet'}
        />
      ) : null}
    </WorldCupShell>
  )
}

export function WorldCupMatchDetailPage() {
  const { matchId } = useParams()
  const { data, error, isLoading, refetch } = useWorldCupData<WorldCupFixture>(
    'getFixture',
    { matchId },
    { refetchIntervalMs: 15_000 },
  )

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError error={error} onRetry={refetch} />
  if (!data) return null

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description={`${data.round} · ${data.city ?? 'Host city pending'} · ${formatDateTime(data.utcDate)}`}
        icon={<Goal className="size-5" />}
        quality={data.quality}
        title={`${data.homeTeam.name} vs ${data.awayTeam.name}`}
      />
      <WorldCupSectionNav />
      <section className="stat-card rounded-fg-xl p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <TeamScore team={data.homeTeam} score={data.homeScore} align="left" />
          <div className="flex flex-col items-center justify-center">
            <Badge variant={data.status === 'LIVE' ? 'soft' : 'outline'}>
              {data.status === 'LIVE' ? `${data.elapsed ?? 0}'` : data.status}
            </Badge>
            <p className="mt-2 font-mono text-4xl font-black">{data.homeScore ?? '-'}:{data.awayScore ?? '-'}</p>
          </div>
          <TeamScore team={data.awayTeam} score={data.awayScore} align="right" />
        </div>
      </section>
      <MatchMetaGrid fixture={data} />
      <WorldCupScoreBreakdown fixture={data} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Timeline fixture={data} />
        <aside className="flex flex-col gap-4">
          <StatisticsPanel fixture={data} />
          <LineupsPanel lineups={data.lineups ?? []} />
        </aside>
      </div>
    </WorldCupShell>
  )
}

export function WorldCupTeamDetailPage() {
  const { teamId } = useParams()
  const { data, error, isLoading, refetch } = useWorldCupData<{
    team: WorldCupTeam
    squad: WorldCupSquad
    fixtures: WorldCupFixture[]
  }>('getTeam', { teamId })

  if (isLoading && !data) return <WorldCupLoading />
  if (error && !data) return <WorldCupError error={error} onRetry={refetch} />
  if (!data) return null

  return (
    <WorldCupShell>
      <WorldCupPageTitle
        description={`World Cup team profile · Group ${data.team.group ?? 'TBD'}`}
        icon={<Shield className="size-5" />}
        quality={data.squad.quality}
        title={data.team.placeholder ? 'Qualifier pending' : data.team.name}
      />
      <WorldCupSectionNav />
      <WorldCupTeamProfile team={data.team} playersCount={data.squad.players.length} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <WorldCupSquadByPosition players={data.squad.players.slice(0, 30)} />
        <aside className="flex flex-col gap-3">
          <WorldCupDataStatus quality={data.squad.quality} />
          <section className="stat-card rounded-fg-xl p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Team fixtures</h2>
              <Badge variant="outline">{data.fixtures.length}</Badge>
            </div>
            <div className="grid gap-2">
              {data.fixtures.map((fixture) => (
                <WorldCupMatchCard key={fixture.id} fixture={fixture} compact />
              ))}
            </div>
            {!data.fixtures.length ? (
              <p className="rounded-xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                Fixtures appear here once this team is linked to provider matches.
              </p>
            ) : null}
          </section>
        </aside>
      </div>
    </WorldCupShell>
  )
}

function Timeline({ fixture }: { fixture: WorldCupFixture }) {
  return (
    <section className="stat-card rounded-fg-xl p-4">
      <h2 className="text-base font-semibold">Timeline</h2>
      <div className="mt-3 flex flex-col gap-2">
        {fixture.events.length ? (
          fixture.events.map((event) => (
            <div key={event.id} className="surface-soft flex items-center gap-3 rounded-xl p-2.5 text-sm">
              <span className="font-mono text-xs text-muted-foreground">{event.minute}'</span>
              <span className="font-medium">{event.detail}</span>
              <span className="text-muted-foreground">{event.playerName ?? event.teamName ?? 'Event'}</span>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            No live event timeline is available for this match yet.
          </p>
        )}
      </div>
    </section>
  )
}

function StatisticsPanel({ fixture }: { fixture: WorldCupFixture }) {
  const statistics = fixture.statistics ?? []
  return (
    <section className="stat-card rounded-fg-xl p-4">
      <h2 className="text-base font-semibold">Match stats</h2>
      {statistics.length ? (
        <div className="mt-3">
          <MatchStatsChart
            awayName={fixture.awayTeam.code || fixture.awayTeam.name}
            awayTeamId={fixture.awayTeam.id}
            homeName={fixture.homeTeam.code || fixture.homeTeam.name}
            homeTeamId={fixture.homeTeam.id}
            statistics={statistics}
          />
        </div>
      ) : null}
      <div className="mt-3 flex flex-col gap-2">
        {statistics.length ? (
          statistics.slice(0, 12).map((stat) => (
            <div
              key={`${stat.teamId}-${stat.type}`}
              className="surface-soft flex items-center justify-between gap-3 rounded-xl p-2 text-sm"
            >
              <span className="truncate text-muted-foreground">{stat.teamName} · {stat.type}</span>
              <span className="font-mono font-bold">{stat.value}</span>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
            Stats appear when the provider returns match statistics.
          </p>
        )}
      </div>
    </section>
  )
}

function LineupsPanel({ lineups }: { lineups: WorldCupLineup[] }) {
  return (
    <section className="stat-card rounded-fg-xl p-4">
      <h2 className="text-base font-semibold">Lineups</h2>
      <div className="mt-3 flex flex-col gap-3">
        {lineups.length ? (
          lineups.map((lineup) => (
            <div key={lineup.teamId} className="surface-soft rounded-xl p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">{lineup.teamName}</h3>
                <Badge variant="outline">{lineup.formation ?? 'Formation pending'}</Badge>
              </div>
              <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                {lineup.starters.slice(0, 6).map((player) => (
                  <span key={player.id}>{player.number ?? '-'} · {player.name} · {player.position ?? 'Role'}</span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
            Lineups appear close to kickoff when available.
          </p>
        )}
      </div>
    </section>
  )
}
