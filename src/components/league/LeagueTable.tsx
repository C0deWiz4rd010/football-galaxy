import { memo, useMemo, useState } from 'react'

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormDots } from '@/components/shared/FormDots'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLocale } from '@/contexts/LocaleContext'
import { useFavorites } from '@/hooks/useFavorites'
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/useMediaQuery'
import { getCrestSources } from '@/lib/assetSources'
import { cn } from '@/lib/utils'
import { createTeamCrest } from '@/lib/visualAssets'
import type { Standing } from '@/services/types'

type Zone = 'ucl' | 'rel' | undefined

function zoneOf(position: number, total: number): Zone {
  if (position <= 4) return 'ucl'
  if (position >= total - 2) return 'rel'
  return undefined
}

const zoneBar = { ucl: 'bg-zone-ucl', rel: 'bg-zone-rel' } as const

function Crest({ standing, size }: { standing: Standing; size: number }) {
  return (
    <AssetImage
      src={standing.team.crest}
      fallbackSrc={[
        ...getCrestSources(standing.team),
        createTeamCrest(standing.team.shortName, standing.team.primaryColor, standing.team.secondaryColor, standing.position),
      ]}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-xs object-contain"
      style={{ width: size, height: size }}
      loading="lazy"
    />
  )
}

const teamHref = (standing: Standing) => `/${standing.leagueId}/team/${standing.team.id}`
const signed = (value: number) => (value > 0 ? `+${value}` : String(value))

/** Phone row: one tappable link per club, zone bar, points prominent. */
const MobileRow = memo(function MobileRow({ standing, zone, favorite }: { standing: Standing; zone: Zone; favorite: boolean }) {
  const { t } = useLocale()
  return (
    <li>
      <Link
        to={teamHref(standing)}
        className={cn(
          'relative flex min-h-14 items-center gap-3 rounded-md py-2 pl-3 pr-3 transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          favorite && 'bg-warning/5',
        )}
      >
        {zone ? <span aria-hidden className={cn('absolute inset-y-2 left-0 w-1 rounded-full', zoneBar[zone])} /> : null}
        <span className="w-5 shrink-0 text-center font-mono text-sm tabular-nums text-muted-foreground">{standing.position}</span>
        <Crest standing={standing} size={28} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{standing.team.name}</span>
            {favorite ? <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" aria-label={t('favoriteLegend')} /> : null}
          </span>
          <span className="mt-0.5 flex items-center gap-2 whitespace-nowrap text-xs tabular-nums text-muted-foreground">
            <span>
              {t('playedShort')} {standing.played}
            </span>
            <span aria-hidden>·</span>
            <span>
              {t('gdShort')} {signed(standing.goalDifference)}
            </span>
            {standing.form.length ? <FormDots form={standing.form.slice(-5)} className="ml-auto" /> : null}
          </span>
        </span>
        <span className="w-9 shrink-0 text-right font-mono text-lg font-bold tabular-nums">{standing.points}</span>
      </Link>
    </li>
  )
})

/** Columns that only fit from `lg` up; md keeps the essentials. */
const wideOnly = new Set(['won', 'drawn', 'lost', 'goals'])

function DesktopTable({ standings }: { standings: Standing[] }) {
  const favorites = useFavorites()
  const { t } = useLocale()
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<Standing>[]>(
    () => [
      { accessorKey: 'position', header: t('posShort') },
      {
        id: 'team',
        accessorFn: (row) => row.team.name,
        header: t('team'),
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            to={teamHref(row.original)}
            className="flex min-w-0 items-center gap-2 font-medium after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            <Crest standing={row.original} size={24} />
            <span className="truncate">{row.original.team.name}</span>
            {favorites.isTeamFavorite(row.original.team.id) ? (
              <Star className="h-3.5 w-3.5 shrink-0 fill-warning text-warning" aria-label={t('favoriteLegend')} />
            ) : null}
          </Link>
        ),
      },
      { accessorKey: 'played', header: t('playedShort') },
      { accessorKey: 'won', header: t('winsShort') },
      { accessorKey: 'drawn', header: t('drawsShort') },
      { accessorKey: 'lost', header: t('lossesShort') },
      {
        id: 'goals',
        header: t('goalsColHeader'),
        enableSorting: false,
        cell: ({ row }) => `${row.original.goalsFor}:${row.original.goalsAgainst}`,
      },
      { accessorKey: 'goalDifference', header: t('gdShort'), cell: ({ getValue }) => signed(getValue<number>()) },
      { accessorKey: 'points', header: t('pointsShort'), sortDescFirst: true },
      {
        id: 'form',
        header: t('formShort'),
        enableSorting: false,
        cell: ({ row }) => <FormDots form={row.original.form} />,
      },
    ],
    [favorites, t],
  )

  const table = useReactTable({
    data: standings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50">
      <Table>
        <caption className="sr-only">{t('fullStandings')}</caption>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                const canSort = header.column.getCanSort()
                const SortIcon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown
                return (
                  <TableHead
                    key={header.id}
                    scope="col"
                    aria-sort={canSort ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined}
                    className={cn('h-10 px-2 text-xs first:pl-3 last:pr-3', wideOnly.has(header.column.id) && 'hidden lg:table-cell')}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="-mx-1 inline-flex min-h-8 items-center gap-1 rounded-xs px-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon className={cn('h-3 w-3', !sorted && 'opacity-40')} aria-hidden />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const zone = zoneOf(row.original.position, standings.length)
            return (
              <TableRow
                key={row.id}
                className={cn(
                  'relative border-b border-border/50 transition-colors focus-within:bg-foreground/5 hover:bg-foreground/5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring',
                  favorites.isTeamFavorite(row.original.team.id) && 'bg-warning/5',
                )}
              >
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'px-2 py-2.5 tabular-nums first:pl-3 last:pr-3',
                      wideOnly.has(cell.column.id) && 'hidden lg:table-cell',
                      cell.column.id === 'points' && 'font-bold',
                      cell.column.id === 'team' && 'max-w-[14rem]',
                      index === 0 && 'relative',
                    )}
                  >
                    {index === 0 && zone ? <span aria-hidden className={cn('absolute inset-y-1 left-0 w-[3px] rounded-full', zoneBar[zone])} /> : null}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * League standings. Desktop renders a sortable table whose rows are real
 * links; phones get a compact list. Only the variant for the current viewport
 * is mounted.
 */
export function LeagueTable({ standings }: { standings: Standing[] }) {
  const favorites = useFavorites()
  const { t } = useLocale()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  return (
    <section className="stat-card" aria-labelledby="league-table-heading">
      <div className="mb-4 flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('primaryLeagueView')}</p>
          <h2 id="league-table-heading" className="mt-1 text-lg font-semibold tracking-tight">
            {t('fullStandings')}
          </h2>
        </div>
        <span className="hidden max-w-xs text-xs text-muted-foreground xl:block">{t('standingsTableHint')}</span>
      </div>
      {standings.length === 0 ? (
        <EmptyState title={t('noStandingsAvailable')} description={t('standingsWillAppear')} className="min-h-0 border-0 p-0" />
      ) : (
        <>
          {isDesktop ? (
            <DesktopTable standings={standings} />
          ) : (
            <ol className="-mx-1 divide-y divide-border/50" aria-label={t('fullStandings')}>
              {standings.map((standing) => (
                <MobileRow
                  key={standing.id}
                  standing={standing}
                  zone={zoneOf(standing.position, standings.length)}
                  favorite={favorites.isTeamFavorite(standing.team.id)}
                />
              ))}
            </ol>
          )}
          <div className="mt-3 grid gap-2 rounded-lg border border-border/45 bg-background/35 p-3 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
            <p className="sm:col-span-2 xl:col-span-4">
              <span className="font-semibold text-foreground/80">{t('tableLegend')}: </span>
              {t('tableAbbrevLegend')}
            </p>
            <p className="flex items-center gap-2">
              <span aria-hidden className="h-4 w-1 rounded-full bg-zone-ucl" />
              {t('championsLeagueLegend')}
            </p>
            <p className="flex items-center gap-2">
              <span aria-hidden className="h-4 w-1 rounded-full bg-zone-rel" />
              {t('relegationLegend')}
            </p>
            <p className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden />
              {t('favoriteLegend')}
            </p>
            <p className="flex items-center gap-2">
              <FormDots
                form={[
                  { result: 'W', opponent: '', score: '', date: '2026-05-01T12:00:00Z' },
                  { result: 'D', opponent: '', score: '', date: '2026-05-08T12:00:00Z' },
                  { result: 'L', opponent: '', score: '', date: '2026-05-15T12:00:00Z' },
                ]}
              />
              {t('formLegend')}
            </p>
          </div>
        </>
      )}
    </section>
  )
}
