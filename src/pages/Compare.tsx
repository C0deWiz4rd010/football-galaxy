import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { ArrowRight, Gauge, Loader2, Sparkles, Swords, Target, X } from 'lucide-react'

import { ProfileRadar } from '@/components/charts/ProfileRadar'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { FormBadge } from '@/components/shared/FormBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState, NotFoundState } from '@/components/shared/StatusStates'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { useLeagueSummaries, usePlayer } from '@/hooks/queries/football'
import { MIN_SEARCH_LENGTH, useFootballSearch } from '@/hooks/queries/search'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { getCrestSources, getPlayerPhotoSources } from '@/lib/assetSources'
import { getLeague, isLeagueId } from '@/lib/leagues'
import { buildMetricPools, percentileRank, playerMetrics } from '@/lib/percentiles'
import { getFormScore } from '@/lib/player-ratings'
import { createPlayerAvatar, createTeamCrest, initialsFromName } from '@/lib/visualAssets'
import { isNotFoundError } from '@/services/errors'
import type { SearchHit } from '@/services/espn/search'
import type { LeagueId, Player, Team } from '@/services/types'

const formatMetric = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(2))

function PercentileRow({ label, leftPct, rightPct, leftValue, rightValue }: { label: string; leftPct: number; rightPct: number; leftValue: number; rightValue: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2">
        <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">{formatMetric(leftValue)}</span>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/50" role="img" aria-label={`${leftPct}%`}>
          <div className="absolute inset-y-0 right-0 rounded-full bg-primary/70" style={{ width: `${leftPct}%` }} />
        </div>
      </div>
      <span className="min-w-[5.5rem] text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/50" role="img" aria-label={`${rightPct}%`}>
          <div className="absolute inset-y-0 left-0 rounded-full bg-info/70" style={{ width: `${rightPct}%` }} />
        </div>
        <span className="w-9 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{formatMetric(rightValue)}</span>
      </div>
    </div>
  )
}

interface Selection {
  playerId: string
  leagueId: LeagueId
}

function useSelection(key: 'p1' | 'p2', leagueKey: 'l1' | 'l2') {
  const [params, setParams] = useSearchParams()
  const playerId = params.get(key) ?? ''
  const leagueParam = params.get(leagueKey) ?? undefined
  const selection: Selection | null = playerId && isLeagueId(leagueParam) ? { playerId, leagueId: leagueParam } : null
  const choose = (hit: { id: string; leagueId: LeagueId } | null) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (hit) {
          next.set(key, hit.id)
          next.set(leagueKey, hit.leagueId)
        } else {
          next.delete(key)
          next.delete(leagueKey)
        }
        return next
      },
      { replace: true },
    )
  }
  return [selection, choose] as const
}

function PlayerPicker({
  label,
  placeholder,
  selected,
  isLoading,
  onSelect,
}: {
  label: string
  placeholder: string
  selected?: Player
  isLoading: boolean
  onSelect: (hit: SearchHit | null) => void
}) {
  const { t } = useLocale()
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 250)
  const search = useFootballSearch(debounced)
  const results = query.trim().length >= MIN_SEARCH_LENGTH ? (search.data?.players ?? []).slice(0, 8) : []
  const listId = `${label.replace(/\W+/g, '-')}-results`

  return (
    <div className="stat-card">
      <label className="text-xs uppercase tracking-eyebrow text-muted-foreground" htmlFor={`${listId}-input`}>
        {label}
      </label>
      <div className="relative mt-3">
        <input
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-md border bg-background/70 px-3 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {search.isFetching ? <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-muted-foreground" aria-hidden /> : null}
      </div>

      {results.length ? (
        <ul id={listId} role="listbox" className="mt-3 space-y-1">
          {results.map((hit) => (
            <li key={hit.id} role="option" aria-selected={selected?.id === hit.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(hit)
                  setQuery('')
                }}
                className="surface-soft flex w-full items-center gap-2 rounded-md p-2 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <AssetImage
                  src={hit.image ?? ''}
                  fallbackSrc={createPlayerAvatar(initialsFromName(hit.name), getLeague(hit.leagueId).color)}
                  alt=""
                  className="h-8 w-8 rounded-full bg-muted object-cover"
                />
                <span className="min-w-0 flex-1 truncate">{hit.name}</span>
                <span className="shrink-0 truncate text-xs text-muted-foreground">{hit.subtitle ?? getLeague(hit.leagueId).abbreviation}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : query.trim().length >= MIN_SEARCH_LENGTH && !search.isFetching && search.isSuccess ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('noPlayersFound')}</p>
      ) : null}

      {isLoading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {t('loading')}
        </div>
      ) : selected ? (
        <div className="surface-soft mt-4 flex items-center gap-3 rounded-lg p-3">
          <AssetImage
            src={selected.photo}
            fallbackSrc={[...getPlayerPhotoSources(selected), createPlayerAvatar(initialsFromName(selected.name))]}
            alt=""
            className="h-12 w-12 rounded-full bg-muted object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{selected.name}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge>{selected.position}</Badge>
              <FormBadge player={selected} variant="full" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-label={t('removeSelection')}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  )
}

function CompareHeroCard({ player, team }: { player: Player; team?: Team }) {
  const { t } = useLocale()
  const form = getFormScore(player)
  return (
    <div className="surface-soft rounded-xl p-4 shadow-fg-2">
      <div className="flex items-center gap-3">
        <AssetImage
          src={player.photo}
          fallbackSrc={[...getPlayerPhotoSources(player), createPlayerAvatar(initialsFromName(player.name), team?.primaryColor)]}
          alt=""
          className="h-14 w-14 rounded-md bg-muted object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{player.name}</p>
          <p className="truncate text-sm text-muted-foreground">{team?.name ?? t('clubUnavailable')}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-center">
          <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('formLabel')}</p>
          <p className="text-2xl font-bold tabular-nums">{form.score}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge>{player.position}</Badge>
        <FormBadge player={player} variant="label" />
        {form.traits.map((trait) => (
          <Badge key={trait} variant="outline">
            {trait}
          </Badge>
        ))}
      </div>
      {team ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <AssetImage
            src={team.crest}
            fallbackSrc={[...getCrestSources(team), createTeamCrest(team.shortName, team.primaryColor, team.secondaryColor, 0)]}
            alt=""
            className="h-6 w-6 object-contain"
          />
          {team.shortName}
        </div>
      ) : null}
      <Link
        to={`/${player.leagueId}/player/${player.id}`}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
      >
        {t('openProfile')}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  )
}

export default function Compare() {
  const { t } = useLocale()
  const [selection1, choose1] = useSelection('p1', 'l1')
  const [selection2, choose2] = useSelection('p2', 'l2')
  const query1 = usePlayer(selection1?.leagueId, selection1?.playerId)
  const query2 = usePlayer(selection2?.leagueId, selection2?.playerId)
  const player1 = query1.data
  const player2 = query2.data

  const leagueIds = [...new Set([selection1?.leagueId, selection2?.leagueId].filter((id): id is LeagueId => Boolean(id)))]
  const { summaries } = useLeagueSummaries(leagueIds)
  const teamsById = useMemo(() => new Map(summaries.flatMap((summary) => summary.teams).map((team) => [team.id, team])), [summaries])
  const pool = useMemo(() => summaries.flatMap((summary) => summary.playerPool.map((entry) => entry.player)), [summaries])

  const pools = useMemo(() => buildMetricPools(pool), [pool])

  const bothReady = Boolean(player1 && player2)
  const form1 = player1 ? getFormScore(player1) : null
  const form2 = player2 ? getFormScore(player2) : null

  const rows =
    player1 && player2 && form1 && form2
      ? ([
          [t('goals'), player1.stats.goals, player2.stats.goals],
          [t('assists'), player1.stats.assists, player2.stats.assists],
          [t('appearancesLabel'), player1.stats.appearances, player2.stats.appearances],
          [t('sortForm'), form1.score, form2.score],
          [t('yellowCardsShort'), player1.stats.yellowCards, player2.stats.yellowCards],
        ] as const)
      : []

  const radar =
    player1 && player2 && pool.length
      ? playerMetrics.map((metric) => ({
          name: t(metric.labelKey),
          p1: percentileRank(pools.get(metric.key) ?? [], metric.value(player1)),
          p2: percentileRank(pools.get(metric.key) ?? [], metric.value(player2)),
        }))
      : []

  const failed = [query1, query2].find((query) => query.isError && !isNotFoundError(query.error))
  const missing = [query1, query2].some((query) => isNotFoundError(query.error))

  return (
    <PageWrapper>
      <div className="space-y-5">
        <section className="stat-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('compareLab')}</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">{t('compareHeading')}</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">{t('compareLongSubtitle')}</p>
            </div>
            <Badge className="w-fit">{t('liveSeasonData')}</Badge>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <PlayerPicker label={t('playerOne')} placeholder={t('searchPlayer1')} selected={player1} isLoading={Boolean(selection1) && query1.isPending} onSelect={choose1} />
          <PlayerPicker label={t('playerTwo')} placeholder={t('searchPlayer2')} selected={player2} isLoading={Boolean(selection2) && query2.isPending} onSelect={choose2} />
        </div>

        {failed ? <ErrorState onRetry={() => void failed.refetch()} /> : null}
        {missing ? <NotFoundState title={t('playerNotFound')} description={t('playerNotFoundDescription')} backTo="/compare" backLabel={t('compareHeading')} /> : null}
        {(selection1 && query1.isPending) || (selection2 && query2.isPending) ? <LoadingSpinner /> : null}

        {bothReady && player1 && player2 && form1 && form2 ? (
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <CompareHeroCard player={player1} team={teamsById.get(player1.teamId)} />
              <CompareHeroCard player={player2} team={teamsById.get(player2.teamId)} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <section className="stat-card">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('attributeContrast')}</p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('radarView')}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t('percentileLeadersSubtitle')}</p>
                  </div>
                  <Swords className="h-5 w-5 text-muted-foreground" aria-hidden />
                </div>
                {radar.length ? (
                  <ProfileRadar
                    data={radar}
                    height={340}
                    valueSuffix=" / 100"
                    series={[
                      { key: 'p1', name: player1.name, tone: 'primary' },
                      { key: 'p2', name: player2.name, tone: 'secondary' },
                    ]}
                  />
                ) : (
                  <LoadingSpinner />
                )}
              </section>

              <section className="stat-card">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('verdict')}</p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('quickRead')}</h2>
                  </div>
                  <Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden />
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">{player1.name}</span>{' '}
                    {form1.score >= form2.score ? t('inBetterForm') : t('trailsOnForm')}.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">{player2.name}</span>{' '}
                    {player2.stats.goals + player2.stats.assists >= player1.stats.goals + player1.stats.assists
                      ? t('leadsOnProduction')
                      : t('behindOnGoalInvolvements')}
                    .
                  </p>
                  <div className="surface-soft rounded-lg p-4">
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('suggestedUsage')}</p>
                    <p className="mt-2 text-sm">{t('suggestedUsageBody')}</p>
                  </div>
                </div>
              </section>
            </div>

            <section className="stat-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('metricDiff')}</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('headToHead')}</h2>
                </div>
                <Target className="h-5 w-5 text-muted-foreground" aria-hidden />
              </div>
              {rows.map(([label, left, right]) => {
                const delta = left - right
                return (
                  <div
                    key={label}
                    className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 text-sm sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center sm:gap-3"
                  >
                    <span className="truncate text-right font-mono tabular-nums">{left}</span>
                    <span className="text-center text-xs text-muted-foreground sm:text-sm">{label}</span>
                    <span className="truncate font-mono tabular-nums">{right}</span>
                    <Badge
                      className={[
                        'justify-self-start sm:justify-self-auto',
                        delta >= 0 ? 'bg-success/15 text-emerald-700 dark:text-success-fg' : 'bg-danger/15 text-red-700 dark:text-danger-fg',
                      ].join(' ')}
                    >
                      {delta > 0 ? '+' : ''}
                      {delta}
                    </Badge>
                  </div>
                )
              })}
            </section>

            {pool.length ? (
              <section className="stat-card space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('percentileEyebrow')}</p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('percentileTitle')}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t('percentileLeadersSubtitle')}</p>
                  </div>
                  <Gauge className="h-5 w-5 text-muted-foreground" aria-hidden />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs font-medium">
                  <span className="truncate text-primary">{player1.name}</span>
                  <span className="truncate text-right text-info">{player2.name}</span>
                </div>
                <div className="space-y-3">
                  {playerMetrics.map((metric) => {
                    const sorted = pools.get(metric.key) ?? []
                    const leftValue = metric.value(player1)
                    const rightValue = metric.value(player2)
                    return (
                      <PercentileRow
                        key={metric.key}
                        label={t(metric.labelKey)}
                        leftValue={leftValue}
                        rightValue={rightValue}
                        leftPct={percentileRank(sorted, leftValue)}
                        rightPct={percentileRank(sorted, rightValue)}
                      />
                    )
                  })}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </PageWrapper>
  )
}
