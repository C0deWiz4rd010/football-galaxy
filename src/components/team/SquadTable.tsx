import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from '@tanstack/react-table'
import { AnimatePresence, motion } from 'framer-motion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AssetImage } from '@/components/shared/AssetImage'
import { FormBadge } from '@/components/shared/FormBadge'
import { getPlayerPhotoSources } from '@/lib/assetSources'
import { getFormScore } from '@/lib/player-ratings'
import { formatMarketValue } from '@/lib/utils'
import { createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { Player } from '@/services/types'

const MemoRow = memo(function MemoRow({ player }: { player: Player }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen((value) => !value)}>
        <TableCell className="font-mono">{player.number}</TableCell>
        <TableCell><div className="flex items-center gap-2"><AssetImage src={player.photo} fallbackSrc={[...getPlayerPhotoSources(player), createPlayerAvatar(initialsFromName(player.name), '#0f766e')]} alt={player.name} className="h-8 w-8 rounded-full object-cover" loading="lazy" /> <span>{player.name}</span><Badge>{player.position}</Badge></div></TableCell>
        <TableCell>{player.age}</TableCell>
        <TableCell>{player.stats.appearances}</TableCell>
        <TableCell>{player.stats.goals}</TableCell>
        <TableCell>{player.stats.assists}</TableCell>
        <TableCell>{player.stats.yellowCards}</TableCell>
        <TableCell><FormBadge player={player} variant="score" /></TableCell>
        <TableCell><span className="inline-flex items-center gap-2"><img src={player.flag} alt="" className="h-4 w-6 rounded-sm object-cover" loading="lazy" /> {player.nationality}</span></TableCell>
      </TableRow>
      <AnimatePresence>
        {open ? (
          <TableRow>
            <TableCell colSpan={9}>
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid gap-3 rounded-lg bg-muted p-4 text-sm sm:grid-cols-6">
                  <span className="inline-flex items-center gap-2">Form <FormBadge player={player} variant="full" /></span><span>Minutes {player.stats.minutes}</span><span>Red {player.stats.redCards}</span><span>{formatMarketValue(player.marketValueEurCents)}</span><span>Contract {player.contractUntil}</span>
                  <Link className="font-medium text-primary" to={`/${player.leagueId}/player/${player.id}`}>View full profile -&gt;</Link>
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        ) : null}
      </AnimatePresence>
    </>
  )
})

function MobileSquadCard({ player }: { player: Player }) {
  const [open, setOpen] = useState(false)
  return (
    <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-xl border bg-card p-4 text-left">
      <div className="flex items-center gap-3">
        <AssetImage src={player.photo} fallbackSrc={[...getPlayerPhotoSources(player), createPlayerAvatar(initialsFromName(player.name), '#0f766e')]} alt={player.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{player.name}</p>
          <p className="text-xs text-muted-foreground">{player.nationality}</p>
        </div>
        <FormBadge player={player} variant="score" />
        <Badge>{player.position}</Badge>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <span>Age {player.age}</span>
              <span>No. {player.number}</span>
              <span>Apps {player.stats.appearances}</span>
              <span>Goals {player.stats.goals}</span>
              <span>Assists {player.stats.assists}</span>
              <span className="col-span-2">{formatMarketValue(player.marketValueEurCents)}</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </button>
  )
}

export function SquadTable({ players }: { players: Player[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const columns = useMemo<ColumnDef<Player>[]>(() => [
    { accessorKey: 'number', header: '#' },
    { accessorKey: 'name', header: 'Player' },
    { accessorKey: 'age', header: 'Age' },
    { accessorKey: 'stats.appearances', header: 'Apps' },
    { accessorKey: 'stats.goals', header: 'G' },
    { accessorKey: 'stats.assists', header: 'A' },
    { accessorKey: 'stats.yellowCards', header: 'YC' },
    { id: 'form', header: 'Form', accessorFn: (player) => getFormScore(player).score },
    { accessorKey: 'nationality', header: 'Nationality' },
  ], [])
  const table = useReactTable({ data: players, columns, state: { sorting, globalFilter }, onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel() })
  return (
    <div>
      <input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Search squad..." className="mb-4 h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <div className="hidden md:block">
        <Table>
          <TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>{group.headers.map((header) => <TableHead key={header.id}><button type="button" onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}</button></TableHead>)}</TableRow>)}</TableHeader>
          <TableBody>{table.getRowModel().rows.map((row) => <MemoRow key={row.original.id} player={row.original} />)}</TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">{table.getRowModel().rows.map((row) => <MobileSquadCard key={row.original.id} player={row.original} />)}</div>
    </div>
  )
}
