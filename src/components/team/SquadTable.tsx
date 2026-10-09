import { memo, useDeferredValue, useId, useMemo, useState } from 'react'

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AssetImage } from '@/components/shared/AssetImage'
import { FormBadge } from '@/components/shared/FormBadge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLocale } from '@/contexts/LocaleContext'
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/useMediaQuery'
import { getPlayerPhotoSources } from '@/lib/assetSources'
import { getFormScore } from '@/lib/player-ratings'
import { cn } from '@/lib/utils'
import { createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { Player } from '@/services/types'

const playerHref = (player: Player) => `/${player.leagueId}/player/${player.id}`

function Avatar({ player, size }: { player: Player; size: number }) {
  return (
    <AssetImage
      src={player.photo}
      fallbackSrc={[...getPlayerPhotoSources(player), createPlayerAvatar(initialsFromName(player.name))]}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full bg-muted object-cover"
      loading="lazy"
    />
  )
}

const MobileRow = memo(function MobileRow({ player }: { player: Player }) {
  const { t } = useLocale()
  return (
    <li>
      <Link
        to={playerHref(player)}
        className="flex min-h-14 items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar player={player} size={40} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{player.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {[player.number ? `#${player.number}` : null, player.position, player.nationality].filter(Boolean).join(' · ')}
          </span>
        </span>
        <span className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">
          <span className="block">
            {player.stats.goals} {t('colGoals')} · {player.stats.assists} {t('colAssists')}
          </span>
          <span className="block">
            {player.stats.appearances} {t('colApps')}
          </span>
        </span>
        <FormBadge player={player} variant="score" />
      </Link>
    </li>
  )
})

/** Columns hidden on `md` (tablet) and shown from `lg`. */
const wideOnly = new Set(['age', 'yellow', 'nationality'])

export function SquadTable({ players }: { players: Player[] }) {
  const { t } = useLocale()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const searchId = useId()
  const [sorting, setSorting] = useState<SortingState>([])
  const [query, setQuery] = useState('')
  const globalFilter = useDeferredValue(query)

  const columns = useMemo<ColumnDef<Player>[]>(
    () => [
      { id: 'number', accessorFn: (player) => player.number ?? 0, header: '#', cell: ({ row }) => row.original.number || '–' },
      {
        id: 'name',
        accessorKey: 'name',
        header: t('colPlayer'),
        cell: ({ row }) => (
          <Link
            to={playerHref(row.original)}
            className="flex min-w-0 items-center gap-2 font-medium after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            <Avatar player={row.original} size={32} />
            <span className="truncate">{row.original.name}</span>
          </Link>
        ),
      },
      { id: 'position', accessorKey: 'position', header: t('colPos') },
      { id: 'age', accessorFn: (player) => player.age ?? 0, header: t('colAge'), cell: ({ row }) => row.original.age ?? '–' },
      { id: 'apps', accessorFn: (player) => player.stats.appearances, header: t('colApps'), sortDescFirst: true },
      { id: 'goals', accessorFn: (player) => player.stats.goals, header: t('colGoals'), sortDescFirst: true },
      { id: 'assists', accessorFn: (player) => player.stats.assists, header: t('colAssists'), sortDescFirst: true },
      { id: 'yellow', accessorFn: (player) => player.stats.yellowCards, header: t('colYellow'), sortDescFirst: true },
      {
        id: 'form',
        accessorFn: (player) => getFormScore(player).score,
        header: t('formShort'),
        sortDescFirst: true,
        cell: ({ row }) => <FormBadge player={row.original} variant="score" />,
      },
      { id: 'nationality', accessorKey: 'nationality', header: t('colNation') },
    ],
    [t],
  )

  const table = useReactTable({
    data: players,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
  })
  const rows = table.getRowModel().rows

  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          {t('squadSearchLabel')}
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('squadSearchPlaceholder')}
          className="h-11 w-full rounded-md border bg-background pl-9 pr-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
        />
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground" role="status">
          {t('noSquadMatches')}
        </p>
      ) : isDesktop ? (
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <Table>
            <caption className="sr-only">{t('squadTableCaption')}</caption>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="bg-muted/40 hover:bg-muted/40">
                  {group.headers.map((header) => {
                    const sorted = header.column.getIsSorted()
                    const SortIcon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown
                    return (
                      <TableHead
                        key={header.id}
                        scope="col"
                        aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                        className={cn('h-10 px-2 text-xs first:pl-3 last:pr-3', wideOnly.has(header.column.id) && 'hidden lg:table-cell')}
                      >
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-1 inline-flex min-h-8 items-center gap-1 rounded-xs px-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon className={cn('h-3 w-3', !sorted && 'opacity-40')} aria-hidden />
                        </button>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.original.id}
                  className="relative transition-colors focus-within:bg-foreground/5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring hover:bg-foreground/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'px-2 py-2 tabular-nums first:pl-3 last:pr-3',
                        wideOnly.has(cell.column.id) && 'hidden lg:table-cell',
                        cell.column.id === 'name' && 'max-w-[16rem]',
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <ul className="-mx-1 divide-y divide-border/50" aria-label={t('squadTableCaption')}>
          {rows.map((row) => (
            <MobileRow key={row.original.id} player={row.original} />
          ))}
        </ul>
      )}
    </div>
  )
}
