import { memo } from 'react'

import { ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { getPlayerPhotoSources } from '@/lib/assetSources'
import { createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { Assist, Scorer } from '@/services/types'

type Item = Scorer | Assist

const ScorersItem = memo(function ScorersItem({
  item,
  value,
  label,
}: {
  item: Item
  value: number
  label: string
}) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/${item.player.leagueId}/player/${item.player.id}`)}
      className="interactive-card surface-soft flex w-full items-center gap-3 rounded-[1.15rem] px-3 py-2.5 text-left hover:border-border/70 hover:bg-background/60"
    >
      <div className="relative h-11 w-11 shrink-0">
        <AssetImage
          src={item.player.photo}
          fallbackSrc={[
            ...getPlayerPhotoSources(item.player),
            createPlayerAvatar(
              initialsFromName(item.player.name),
              item.team.primaryColor ?? '#0f766e',
            ),
          ]}
          alt={item.player.name}
          className="h-11 w-11 rounded-full object-cover"
          loading="lazy"
        />
        <span className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
          <img
            src={item.player.flag}
            alt={`${item.player.nationality} flag`}
            className="h-4 w-5 rounded-sm object-cover"
            loading="lazy"
          />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{item.player.name}</p>
            <p className="text-xs text-muted-foreground">{item.team.shortName}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xl font-bold leading-none">{value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>
          </div>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  )
})

export function TopScorersCard({
  title,
  items,
  type = 'goals',
  compact = false,
}: {
  title: string
  items: Item[]
  type?: 'goals' | 'assists'
  compact?: boolean
}) {
  const navigate = useNavigate()

  return (
    <section className={compact ? 'surface-soft overflow-hidden rounded-[1rem] p-3' : 'stat-card overflow-hidden'}>
      <div className={compact ? 'mb-2 flex items-center justify-between gap-3' : 'mb-3 flex items-center justify-between gap-3'}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Leaders</p>
          <h2 className={compact ? 'mt-0.5 text-sm font-semibold tracking-tight' : 'mt-1 text-base font-semibold tracking-tight'}>{title}</h2>
        </div>
        <span className="text-xs text-muted-foreground">Top 5</span>
      </div>
      {items.length > 0 ? (
        <div className={compact ? 'divide-y divide-border/45' : 'space-y-2'}>
          {items.slice(0, compact ? 3 : 5).map((item, index) => (
            compact ? (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/${item.player.leagueId}/player/${item.player.id}`)}
                className="grid w-full grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 py-2 text-left text-sm hover:text-primary"
              >
                <span className="font-mono text-xs text-muted-foreground">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.player.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.team.shortName}</span>
                </span>
                <span className="font-mono text-lg font-bold leading-none">{type === 'goals' ? item.goals : item.assists}</span>
              </button>
            ) : (
              <ScorersItem
                key={item.id}
                item={item}
                value={type === 'goals' ? item.goals : item.assists}
                label={type}
              />
            )
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${title.toLowerCase()} yet`}
          description="This leaderboard will appear once player statistics are available."
          className="min-h-0 border-0 p-0"
        />
      )}
    </section>
  )
}
