import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Swords, Target } from 'lucide-react'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { FormBadge } from '@/components/shared/FormBadge'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { mockData } from '@/data/mock'
import { getCrestSources, getPlayerPhotoSources } from '@/lib/assetSources'
import { getFormScore } from '@/lib/player-ratings'
import {
  createPlayerAvatar,
  createTeamCrest,
  initialsFromName,
} from '@/lib/visualAssets'
import type { Player, Team } from '@/services/types'

function PlayerSearch({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value?: string
  onChange: (player: Player) => void
  placeholder: string
}) {
  const [query, setQuery] = useState('')
  const players = useMemo(
    () =>
      Object.values(mockData)
        .flatMap((league) => league.teams)
        .flatMap((team) => team.squad ?? []),
    [],
  )
  const selected = players.find((player) => player.id === value)
  const results =
    query.length >= 1
      ? players
          .filter((player) => player.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 8)
      : []

  return (
    <div className="stat-card">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="mt-3 h-11 w-full rounded-xl border bg-background/70 px-3 text-sm"
      />
      {selected ? (
        <div className="surface-soft mt-4 flex items-center gap-3 rounded-fg-lg p-3">
          <AssetImage
            src={selected.photo}
            fallbackSrc={[
              ...getPlayerPhotoSources(selected),
              createPlayerAvatar(initialsFromName(selected.name), '#0f766e'),
            ]}
            alt={selected.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold">{selected.name}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge>{selected.position}</Badge>
              <FormBadge player={selected} variant="full" />
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-3 space-y-1">
        {results.map((player) => (
          <button
            type="button"
            key={player.id}
            onClick={() => {
              onChange(player)
              setQuery('')
            }}
            className="surface-soft flex w-full items-center gap-2 rounded-xl p-2 text-left hover:bg-white/8"
          >
            <AssetImage
              src={player.photo}
              fallbackSrc={[
                ...getPlayerPhotoSources(player),
                createPlayerAvatar(initialsFromName(player.name), '#0f766e'),
              ]}
              alt={player.name}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="truncate">{player.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function CompareHeroCard({
  player,
  team,
}: {
  player: Player
  team?: Team
}) {
  const { t } = useLocale()
  const form = getFormScore(player)

  return (
    <div className="surface-soft rounded-fg-xl p-4 shadow-fg-2">
      <div className="flex items-center gap-3">
        <AssetImage
          src={player.photo}
          fallbackSrc={[
            ...getPlayerPhotoSources(player),
            createPlayerAvatar(initialsFromName(player.name), team?.primaryColor ?? '#0f766e'),
          ]}
          alt={player.name}
          className="h-14 w-14 rounded-fg-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{player.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {team?.name ?? t('clubUnavailable')}
          </p>
        </div>
        <div className="rounded-fg-lg border border-white/10 bg-white/5 px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t('formLabel')}</p>
          <p className="text-2xl font-black">{form.score}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge>{player.position}</Badge>
        <FormBadge player={player} variant="label" />
        {form.traits.map((trait) => (
          <Badge key={trait} variant="outline">{trait}</Badge>
        ))}
      </div>
      {team ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <AssetImage
            src={team.crest}
            fallbackSrc={[
              ...getCrestSources(team),
              createTeamCrest(
                team.shortName,
                team.primaryColor ?? '#0f766e',
                team.secondaryColor ?? '#f8fafc',
                0,
              ),
            ]}
            alt={team.name}
            className="h-6 w-6 rounded-lg object-cover"
          />
          {team.shortName}
        </div>
      ) : null}
      <Link
        to={`/${player.leagueId}/player/${player.id}`}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
      >
        {t('openProfile')}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default function Compare() {
  const { t } = useLocale()
  const [params, setParams] = useSearchParams()
  const teams = useMemo(
    () => Object.values(mockData).flatMap((league) => league.teams),
    [],
  )
  const players = useMemo(
    () => teams.flatMap((team) => team.squad ?? []),
    [teams],
  )
  const [p1, setP1] = useState(params.get('p1') ?? '')
  const [p2, setP2] = useState(params.get('p2') ?? '')
  const player1 = players.find((player) => player.id === p1)
  const player2 = players.find((player) => player.id === p2)
  const team1 = teams.find((team) => team.id === player1?.teamId)
  const team2 = teams.find((team) => team.id === player2?.teamId)

  const choose = (key: 'p1' | 'p2', player: Player) => {
    const next = new URLSearchParams(params)
    next.set(key, player.id)
    setParams(next)
    if (key === 'p1') {
      setP1(player.id)
    } else {
      setP2(player.id)
    }
  }

  const form1 = player1 ? getFormScore(player1) : null
  const form2 = player2 ? getFormScore(player2) : null

  const rows =
    player1 && player2 && form1 && form2
      ? [
          [t('goals'), player1.stats.goals, player2.stats.goals],
          [t('assists'), player1.stats.assists, player2.stats.assists],
          [t('minutes'), player1.stats.minutes, player2.stats.minutes],
          [t('sortForm'), form1.score, form2.score],
          [t('appearancesLabel'), player1.stats.appearances, player2.stats.appearances],
          [t('yellowCardsShort'), player1.stats.yellowCards, player2.stats.yellowCards],
        ] as const
      : []

  const radar =
    player1 && player2
      ? Object.keys(player1.stats.attributes).map((key) => ({
          name: key.toUpperCase(),
          p1: player1.stats.attributes[key as keyof typeof player1.stats.attributes],
          p2: player2.stats.attributes[key as keyof typeof player2.stats.attributes],
        }))
      : []

  return (
    <PageWrapper>
      <div className="space-y-5">
        <section className="stat-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {t('compareLab')}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">{t('compareHeading')}</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {t('compareLongSubtitle')}
              </p>
            </div>
            <Badge className="w-fit">{t('liveSeasonData')}</Badge>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <PlayerSearch
            label={t('playerOne')}
            value={p1}
            onChange={(player) => choose('p1', player)}
            placeholder={t('searchPlayer1')}
          />
          <PlayerSearch
            label={t('playerTwo')}
            value={p2}
            onChange={(player) => choose('p2', player)}
            placeholder={t('searchPlayer2')}
          />
        </div>

        {player1 && player2 && form1 && form2 ? (
          <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <CompareHeroCard player={player1} team={team1} />
              <CompareHeroCard player={player2} team={team2} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <section className="stat-card">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {t('attributeContrast')}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('radarView')}</h2>
                  </div>
                  <Swords className="h-5 w-5 text-muted-foreground" />
                </div>
                <ResponsiveContainer width="100%" height={360}>
                  <RadarChart data={radar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <Tooltip />
                    <Radar
                      name={player1.name}
                      dataKey="p1"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.32}
                    />
                    <Radar
                      name={player2.name}
                      dataKey="p2"
                      stroke="#22c55e"
                      strokeDasharray="4 4"
                      fill="#22c55e"
                      fillOpacity={0.14}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </section>

              <section className="stat-card">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {t('verdict')}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('quickRead')}</h2>
                  </div>
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
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
                      : t('behindOnGoalInvolvements')}.
                  </p>
                  <div className="surface-soft rounded-fg-lg p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {t('suggestedUsage')}
                    </p>
                    <p className="mt-2 text-sm">
                      {t('suggestedUsageBody')}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <section className="stat-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {t('metricDiff')}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('headToHead')}</h2>
                </div>
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              {rows.map(([label, left, right]) => {
                const delta = left - right
                return (
                  <div
                    key={label}
                    className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 text-sm sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center sm:gap-3"
                  >
                    <span className="truncate text-right font-mono">{left}</span>
                    <span className="text-center text-xs text-muted-foreground sm:text-sm">
                      {label}
                    </span>
                    <span className="truncate font-mono">{right}</span>
                    <Badge
                      className={[
                        'justify-self-start sm:justify-self-auto',
                        delta >= 0
                          ? 'bg-green-500/15 text-green-700'
                          : 'bg-red-500/15 text-red-400',
                      ].join(' ')}
                    >
                      {delta > 0 ? '+' : ''}
                      {delta}
                    </Badge>
                  </div>
                )
              })}
            </section>
          </motion.div>
        ) : null}
      </div>
    </PageWrapper>
  )
}
