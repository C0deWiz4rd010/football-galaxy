import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { AssetImage } from '@/components/shared/AssetImage'
import { mockData } from '@/data/mock'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { Player } from '@/services/types'

function PlayerSearch({ value, onChange, placeholder }: { value?: string; onChange: (player: Player) => void; placeholder: string }) {
  const [query, setQuery] = useState('')
  const players = useMemo(() => Object.values(mockData).flatMap((league) => league.teams).flatMap((team) => team.squad ?? []), [])
  const selected = players.find((player) => player.id === value)
  const results = query.length >= 1 ? players.filter((player) => player.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : []
  return (
    <div className="stat-card">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
      {selected ? <div className="mt-4 flex items-center gap-3"><AssetImage src={selected.photo} fallbackSrc={createPlayerAvatar(initialsFromName(selected.name), '#0f766e')} alt={selected.name} className="h-12 w-12 rounded-full object-cover" /><div className="min-w-0"><p className="truncate font-semibold">{selected.name}</p><Badge>{selected.position}</Badge></div></div> : null}
      <div className="mt-3 space-y-1">{results.map((player) => <button type="button" key={player.id} onClick={() => { onChange(player); setQuery('') }} className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-muted"><AssetImage src={player.photo} fallbackSrc={createPlayerAvatar(initialsFromName(player.name), '#0f766e')} alt={player.name} className="h-8 w-8 rounded-full object-cover" /> <span className="truncate">{player.name}</span></button>)}</div>
    </div>
  )
}

export default function Compare() {
  const [params, setParams] = useSearchParams()
  const players = useMemo(() => Object.values(mockData).flatMap((league) => league.teams).flatMap((team) => team.squad ?? []), [])
  const [p1, setP1] = useState(params.get('p1') ?? '')
  const [p2, setP2] = useState(params.get('p2') ?? '')
  const player1 = players.find((player) => player.id === p1)
  const player2 = players.find((player) => player.id === p2)
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
  const rows = player1 && player2 ? [
    ['Goals', player1.stats.goals, player2.stats.goals],
    ['Assists', player1.stats.assists, player2.stats.assists],
    ['Minutes', player1.stats.minutes, player2.stats.minutes],
    ['Yellow Cards', player1.stats.yellowCards, player2.stats.yellowCards],
  ] as const : []
  const radar = player1 && player2 ? Object.keys(player1.stats.attributes).map((key) => ({ name: key, p1: player1.stats.attributes[key as keyof typeof player1.stats.attributes], p2: player2.stats.attributes[key as keyof typeof player2.stats.attributes] })) : []
  return (
    <PageWrapper>
      <div className="mb-5"><h1 className="text-3xl font-semibold tracking-tight">Compare Players</h1><p className="text-muted-foreground">Search two players and compare output, availability, and attributes.</p></div>
      <div className="grid gap-4 md:grid-cols-2"><PlayerSearch value={p1} onChange={(player) => choose('p1', player)} placeholder="Search player name..." /><PlayerSearch value={p2} onChange={(player) => choose('p2', player)} placeholder="Search player name..." /></div>
      {player1 && player2 ? (
        <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 grid gap-4">
          <section className="stat-card space-y-3">{rows.map(([label, left, right]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 text-sm sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center sm:gap-3"><span className="truncate text-right font-mono">{left}</span><span className="text-center text-xs text-muted-foreground sm:text-sm">{label}</span><span className="truncate font-mono">{right}</span><Badge className="justify-self-start bg-green-500/15 text-green-700 sm:justify-self-auto">{left - right > 0 ? '+' : ''}{left - right}</Badge></div>)}</section>
          <section className="stat-card"><ResponsiveContainer width="100%" height={330}><RadarChart data={radar}><PolarGrid /><PolarAngleAxis dataKey="name" /><Tooltip /><Radar name={player1.name} dataKey="p1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} /><Radar name={player2.name} dataKey="p2" stroke="#22c55e" strokeDasharray="4 4" fill="#22c55e" fillOpacity={0.15} /></RadarChart></ResponsiveContainer></section>
        </motion.div>
      ) : null}
    </PageWrapper>
  )
}
