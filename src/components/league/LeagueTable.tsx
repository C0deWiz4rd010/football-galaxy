import { memo, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpDown, Star } from 'lucide-react'

import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormDots } from '@/components/shared/FormDots'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLocale } from '@/contexts/LocaleContext'
import { useFavorites } from '@/hooks/useFavorites'
import { getCrestSources } from '@/lib/assetSources'
import { cn } from '@/lib/utils'
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

const LeagueTableRow = memo(function LeagueTableRow({
  standing,
  onOpen,
}: {
  standing: Standing
  onOpen: (standing: Standing) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      onClick={() => setExpanded((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setExpanded((value) => !value)
        }
      }}
      role="button"
      tabIndex={0}
      className="interactive-card surface-soft w-full rounded-fg-lg p-4 text-left md:hidden"
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-muted font-mono text-sm">
            {standing.position}
          </span>
          <AssetImage
            src={standing.team.crest}
            fallbackSrc={[
              ...getCrestSources(standing.team),
              createTeamCrest(
                standing.team.shortName,
                standing.team.primaryColor ?? '#0f766e',
                standing.team.secondaryColor ?? '#f8fafc',
                standing.position,
              ),
            ]}
            alt={standing.team.name}
            className="h-8 w-8 rounded object-cover"
            loading="lazy"
          />
          <span className="truncate font-semibold">{standing.team.name}</span>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpen(standing)
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 font-mono text-xl font-bold"
        >
          {standing.points}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Form</span>
        <FormDots form={standing.form} />
      </div>
      {expanded ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-3 grid grid-cols-5 gap-2 text-center text-xs"
        >
          <span>GP {standing.played}</span>
          <span>W {standing.won}</span>
          <span>D {standing.drawn}</span>
          <span>L {standing.lost}</span>
          <span>GD {standing.goalDifference}</span>
        </motion.div>
      ) : null}
    </motion.div>
  )
})

export function LeagueTable({ standings }: { standings: Standing[] }) {
  const navigate = useNavigate()
  const favorites = useFavorites()
  const { t } = useLocale()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'points', desc: true },
    { id: 'goalDifference', desc: true },
  ])

  const columns = useMemo<ColumnDef<Standing>[]>(
    () => [
      { accessorKey: 'position', header: t('posShort') },
      {
        accessorKey: 'team.name',
        header: t('team'),
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2">
            <AssetImage
              src={row.original.team.crest}
              fallbackSrc={[
                ...getCrestSources(row.original.team),
                createTeamCrest(
                  row.original.team.shortName,
                  row.original.team.primaryColor ?? '#0f766e',
                  row.original.team.secondaryColor ?? '#f8fafc',
                  row.original.position,
                ),
              ]}
              alt={row.original.team.name}
              className="h-6 w-6 rounded object-cover"
              loading="lazy"
            />
            <span className="truncate font-medium">{row.original.team.name}</span>
          </div>
        ),
        enableSorting: false,
      },
      { accessorKey: 'played', header: t('playedShort') },
      { accessorKey: 'won', header: t('winsShort') },
      { accessorKey: 'drawn', header: t('drawsShort') },
      { accessorKey: 'lost', header: t('lossesShort') },
      {
        id: 'goals',
        header: t('goalsColHeader'),
        cell: ({ row }) => `${row.original.goalsFor}:${row.original.goalsAgainst}`,
        enableSorting: false,
      },
      { accessorKey: 'goalDifference', header: t('gdShort') },
      { accessorKey: 'points', header: t('pointsShort') },
      {
        id: 'form',
        header: t('formShort'),
        cell: ({ row }) => <FormDots form={row.original.form} />,
        enableSorting: false,
      },
      {
        id: 'open',
        header: '',
        cell: () => <ArrowRight className="h-4 w-4 text-muted-foreground" />,
        enableSorting: false,
      },
    ],
    [t],
  )

  const table = useReactTable({
    data: standings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const openTeam = (standing: Standing) => navigate(`/${standing.leagueId}/team/${standing.team.id}`)

  return (
    <section className="stat-card">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('primaryLeagueView')}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('fullStandings')}</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {t('standingsTableHint')}
        </span>
      </div>
      {standings.length === 0 ? (
        <EmptyState
          title={t('noStandingsAvailable')}
          description={t('standingsWillAppear')}
          className="min-h-0 border-0 p-0"
        />
      ) : null}
      {standings.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-fg-lg border border-border/50 md:block">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    role="row"
                    className="sticky top-0 z-10 bg-background/80 backdrop-blur"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        role="columnheader"
                        aria-sort={
                          header.column.getIsSorted() === 'asc'
                            ? 'ascending'
                            : header.column.getIsSorted() === 'desc'
                              ? 'descending'
                              : 'none'
                        }
                        className="px-2 text-xs first:pl-3 last:pr-3"
                      >
                        <button
                          type="button"
                          disabled={!header.column.getCanSort()}
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() ? (
                            <motion.span
                              animate={{ rotate: header.column.getIsSorted() === 'desc' ? 180 : 0 }}
                            >
                              <ArrowUpDown className="h-3 w-3" />
                            </motion.span>
                          ) : null}
                        </button>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    role="row"
                    tabIndex={0}
                    onClick={() => openTeam(row.original)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openTeam(row.original)
                      }
                    }}
                    className={cn(
                      'cursor-pointer border-b border-border/50 transition-colors hover:bg-background/60 focus:bg-background/60 focus:outline-none',
                      favorites.isTeamFavorite(row.original.team.id) && 'bg-amber-500/5',
                    )}
                    style={{ boxShadow: rowAccent(row.original.position, standings.length) }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} role="cell" className="px-2 py-2.5 first:pl-3 last:pr-3">
                        {cell.column.id === 'open' ? (
                          <div className="flex items-center justify-end gap-2">
                            {favorites.isTeamFavorite(row.original.team.id) ? (
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ) : null}
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 md:hidden">
            {standings.map((standing) => (
              <LeagueTableRow key={standing.id} standing={standing} onOpen={openTeam} />
            ))}
          </div>
          <div className="mt-3 grid gap-2 rounded-fg-lg border border-border/45 bg-background/35 p-3 text-[11px] text-muted-foreground sm:grid-cols-2 xl:grid-cols-5">
            <div>
              <p className="font-semibold uppercase tracking-[0.16em] text-foreground/80">{t('tableLegend')}</p>
              <p className="mt-1">{t('tableAbbrevLegend')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-7 w-1.5 rounded-full bg-blue-500" />
              <span>{t('championsLeagueLegend')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-7 w-1.5 rounded-full bg-red-500" />
              <span>{t('relegationLegend')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{t('favoriteLegend')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FormDots form={[
                { result: 'W', opponent: '', score: '', date: '2026-05-01T12:00:00Z' },
                { result: 'D', opponent: '', score: '', date: '2026-05-08T12:00:00Z' },
                { result: 'L', opponent: '', score: '', date: '2026-05-15T12:00:00Z' },
              ]} />
              <span>{t('formLegend')}</span>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
