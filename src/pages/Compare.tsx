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
import { Badge } from '@/components/ui/badge'
import { mockData } from '@/data/mock'
import { useAppMode } from '@/hooks/useAppMode'
import { getPlayerCardProfile } from '@/lib/player-ratings'
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
        <div className="surface-soft mt-4 flex items-center gap-3 rounded-[1.2rem] p-3">
          <AssetImage
            src={selected.photo}
            fallbackSrc={createPlayerAvatar(initialsFromName(selected.name), '#0f766e')}
            alt={selected.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold">{selected.name}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge>{selected.position}</Badge>
              <Badge variant="outline">OVR {getPlayerCardProfile(selected).overall}</Badge>
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
              fallbackSrc={createPlayerAvatar(initialsFromName(player.name), '#0f766e')}
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
  const card = getPlayerCardProfile(player)

  return (
    <div className="surface-soft rounded-[1.5rem] p-4">
      <div className="flex items-center gap-3">
        <AssetImage
          src={player.photo}
          fallbackSrc={createPlayerAvatar(initialsFromName(player.name), team?.primaryColor ?? '#0f766e')}
          alt={player.name}
          className="h-14 w-14 rounded-[1.1rem] object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{player.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {team?.name ?? 'Club unavailable'}
          </p>
        </div>
        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">OVR</p>
          <p className="text-2xl font-black">{card.overall}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge>{player.position}</Badge>
        <Badge variant="outline">{card.archetype}</Badge>
        <Badge variant="outline">{card.tier}</Badge>
      </div>
      {team ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <AssetImage
            src={team.crest}
            fallbackSrc={createTeamCrest(
              team.shortName,
              team.primaryColor ?? '#0f766e',
              team.secondaryColor ?? '#f8fafc',
              0,
            )}
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
        Open profile
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default function Compare() {
  const [params, setParams] = useSearchParams()
  const { mode } = useAppMode()
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

  const card1 = player1 ? getPlayerCardProfile(player1) : null
  const card2 = player2 ? getPlayerCardProfile(player2) : null

  const rows =
    player1 && player2 && card1 && card2
      ? [
          ['Goals', player1.stats.goals, player2.stats.goals],
          ['Assists', player1.stats.assists, player2.stats.assists],
          ['Minutes', player1.stats.minutes, player2.stats.minutes],
          ['OVR', card1.overall, card2.overall],
          ['Pace', card1.attributes.pace, card2.attributes.pace],
          ['Passing', card1.attributes.passing, card2.attributes.passing],
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
                Compare lab
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">Compare Players</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Search two players and compare live output, role profile, and the Football Galaxy EA FC-style card layer.
              </p>
            </div>
            <Badge className="w-fit">
              {mode === 'ea-fc' ? 'EA FC context active' : 'Galaxy Live context active'}
            </Badge>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <PlayerSearch
            label="Player one"
            value={p1}
            onChange={(player) => choose('p1', player)}
            placeholder="Search player name..."
          />
          <PlayerSearch
            label="Player two"
            value={p2}
            onChange={(player) => choose('p2', player)}
            placeholder="Search second player..."
          />
        </div>

        {player1 && player2 && card1 && card2 ? (
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
                      Attribute contrast
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight">Radar View</h2>
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
                      Verdict
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight">Quick Read</h2>
                  </div>
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">{player1.name}</span>{' '}
                    wins the card race if you value{' '}
                    {card1.overall >= card2.overall ? 'overall impact and projection' : 'less'}.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">{player2.name}</span>{' '}
                    pulls ahead where the raw output favors{' '}
                    {player2.stats.goals + player2.stats.assists >= player1.stats.goals + player1.stats.assists
                      ? 'direct production'
                      : 'less direct scoring'}.
                  </p>
                  <div className="surface-soft rounded-[1.2rem] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Suggested usage
                    </p>
                    <p className="mt-2 text-sm">
                      {mode === 'ea-fc'
                        ? 'Use this view to compare archetypes and card value before we add the full live-vs-card split toggle.'
                        : 'Use this view to compare real output now, then jump into EA FC mode for the attribute-first perspective.'}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <section className="stat-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Metric diff
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">Head-to-Head</h2>
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
