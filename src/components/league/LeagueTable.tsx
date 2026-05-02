import { memo, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { ArrowUpDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FormDots } from '@/components/shared/FormDots'
import { AssetImage } from '@/components/shared/AssetImage'
import { useFavorites } from '@/hooks/useFavorites'
import { createTeamCrest } from '@/lib/visualAssets'
import type { Standing } from '@/services/types'

function rowAccent(position: number, total: number) {
  if (position <= 4) {
    return 'inset 3px 0 0 #3b82f6'
  }
  if (position >= total - 2) {
    return 'inset 3px 0 0 #ef4444'
  }
  return undefined
}

const LeagueTableRow = memo(function LeagueTableRow({ standing, onOpen }: { standing: Standing; onOpen: (standing: Standing) => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.button
      type="button"
      layout
      onClick={() => setExpanded((value) => !value)}
      className="w-full rounded-lg border bg-card p-4 text-left shadow-sm md:hidden"
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-muted font-mono text-sm">{standing.position}</span>
          <AssetImage src={standing.team.crest} fallbackSrc={createTeamCrest(standing.team.shortName, standing.team.primaryColor ?? '#0f766e', standing.team.secondaryColor ?? '#f8fafc', standing.position)} alt={standing.team.name} className="h-8 w-8 rounded object-cover" loading="lazy" />
          <span className="truncate font-semibold">{standing.team.name}</span>
        </div>
        <button type="button" onClick={(event) => { event.stopPropagation(); onOpen(standing) }} className="font-mono text-2xl font-bold">{standing.points}</button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Form</span>
        <FormDots form={standing.form} />
      </div>
      {expanded ? <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 grid grid-cols-5 gap-2 text-center text-xs"><span>GP {standing.played}</span><span>W {standing.won}</span><span>D {standing.drawn}</span><span>L {standing.lost}</span><span>GD {standing.goalDifference}</span></motion.div> : null}
    </motion.button>
  )
})

export function LeagueTable({ standings }: { standings: Standing[] }) {
  const navigate = useNavigate()
  const favorites = useFavorites()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'points', desc: true },
    { id: 'goalDifference', desc: true },
  ])

  const columns = useMemo<ColumnDef<Standing>[]>(
    () => [
      { accessorKey: 'position', header: 'Pos' },
      {
        accessorKey: 'team.name',
        header: 'Team',
        cell: ({ row }) => <div className="flex min-w-0 items-center gap-2"><AssetImage src={row.original.team.crest} fallbackSrc={createTeamCrest(row.original.team.shortName, row.original.team.primaryColor ?? '#0f766e', row.original.team.secondaryColor ?? '#f8fafc', row.original.position)} alt={row.original.team.name} className="h-5 w-5 rounded object-cover" loading="lazy" /> <span className="truncate font-medium">{row.original.team.name}</span></div>,
        enableSorting: false,
      },
      { accessorKey: 'played', header: 'GP' },
      { accessorKey: 'won', header: 'W' },
      { accessorKey: 'drawn', header: 'D' },
      { accessorKey: 'lost', header: 'L' },
      { accessorKey: 'goalsFor', header: 'GF' },
      { accessorKey: 'goalsAgainst', header: 'GA' },
      { accessorKey: 'goalDifference', header: 'GD' },
      { accessorKey: 'points', header: 'Pts' },
      { id: 'form', header: 'Form', cell: ({ row }) => <FormDots form={row.original.form} />, enableSorting: false },
    ],
    [],
  )

  const table = useReactTable({ data: standings, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() })

  const openTeam = (standing: Standing) => navigate(`/${standing.leagueId}/team/${standing.team.id}`)

  return (
    <section className="stat-card col-span-2">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">League Table</h2>
        <span className="text-xs text-muted-foreground">Sort state persists in session</span>
      </div>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} role="row">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} role="columnheader" aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : 'none'}>
                    <button type="button" disabled={!header.column.getCanSort()} onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() ? <motion.span animate={{ rotate: header.column.getIsSorted() === 'desc' ? 180 : 0 }}><ArrowUpDown className="h-3 w-3" /></motion.span> : null}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <DropdownMenu key={row.id}>
                <DropdownMenuTrigger asChild>
                  <motion.tr
                    role="row"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => openTeam(row.original)}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/40"
                    style={{ boxShadow: rowAccent(row.original.position, standings.length) }}
                  >
                    {row.getVisibleCells().map((cell) => <TableCell key={cell.id} role="cell">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                  </motion.tr>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => window.open(`/${row.original.leagueId}/team/${row.original.team.id}`, '_blank')}>Open team in new tab</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => favorites.toggleTeam(row.original.team.id)}>Add to favorites</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">{standings.map((standing) => <LeagueTableRow key={standing.id} standing={standing} onOpen={openTeam} />)}</div>
    </section>
  )
}
