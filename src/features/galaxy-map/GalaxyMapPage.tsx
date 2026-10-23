import { memo, useState } from 'react'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronRight, Lock, Sparkles, Star, Trophy, Swords, Users, X, Zap } from 'lucide-react'

import { useLocale } from '@/contexts/LocaleContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { GalaxyNode, NodeType, Region, RegionMilestone } from './types'
import { useGalaxy } from './context-core'
import { localize } from './localize'

// ─── Node type icons ─────────────────────────────────────────────────────────

const NodeIcon = memo(function NodeIcon({ type, className, color }: { type: NodeType; className?: string; color?: string }) {
  const style = color ? ({ color } as React.CSSProperties) : undefined
  switch (type) {
    case 'trophy': return <Trophy className={className} style={style} />
    case 'rivalry': return <Swords className={className} style={style} />
    case 'legend': return <Star className={className} style={style} />
    case 'challenge': return <Zap className={className} style={style} />
    case 'team': return <Users className={className} style={style} />
  }
})

// ─── Level indicator dots ────────────────────────────────────────────────────

function LevelDots({ level, max }: { level: number; max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 w-1.5 rounded-full transition-colors',
            i < level ? 'bg-warning' : 'bg-foreground/20',
          )}
        />
      ))}
    </div>
  )
}

// ─── Single node card ────────────────────────────────────────────────────────

function NodeCard({
  node,
  regionColor,
  onSelect,
}: {
  node: GalaxyNode
  regionColor: string
  onSelect: (node: GalaxyNode) => void
}) {
  const { nodeLevel, canUpgrade } = useGalaxy()
  const { locale, t } = useLocale()
  const level = nodeLevel(node.id)
  const isMaxed = level >= node.maxLevel
  const upgradeable = canUpgrade(node.id)
  const cost = node.levelCosts[level]?.toLocaleString(locale) ?? ''
  const isLocked = level === 0 && !upgradeable

  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      aria-haspopup="dialog"
      className={cn(
        'interactive-card relative flex min-h-32 flex-col gap-2 rounded-lg border p-3 text-left',
        isMaxed && 'border-warning/40 bg-warning/5',
        !isMaxed && upgradeable && 'border-success/40 bg-success/5 cursor-pointer',
        !isMaxed && !upgradeable && !isLocked && 'border-border/60 bg-foreground/3 cursor-pointer',
        isLocked && 'border-border/60 bg-foreground/2 cursor-pointer opacity-60',
      )}
    >
      {/* level glow ring when upgradeable */}
      {upgradeable && !isMaxed && (
        <span aria-hidden className="absolute inset-0 rounded-lg ring-1 ring-success/40 motion-safe:animate-pulse" />
      )}

      <div className="flex items-center justify-between gap-2">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md"
          style={{ background: `${regionColor}33` }}
        >
          <NodeIcon type={node.type} className="h-4 w-4" color={regionColor} />
        </span>
        {isLocked ? (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <LevelDots level={level} max={node.maxLevel} />
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{localize(node.title, locale)}</p>
        <p className="line-clamp-2 mt-0.5 text-xs text-muted-foreground">{localize(node.description, locale)}</p>
      </div>

      {!isLocked && !isMaxed && (
        <p className={cn('mt-auto text-xs font-medium', upgradeable ? 'text-success-fg' : 'text-warning-fg')}>
          {upgradeable
            ? t('galaxyUpgradeShort', { level: level + 1, cost })
            : t('galaxyNeedsShort', { level: level + 1, cost })}
        </p>
      )}
      {isMaxed && (
        <p className="mt-auto text-xs font-semibold text-warning-fg">{t('galaxyMaxLevel')}</p>
      )}
    </button>
  )
}

// ─── Milestone badge ─────────────────────────────────────────────────────────

function MilestoneBadge({ milestone, reached }: { milestone: RegionMilestone; reached: boolean }) {
  const { locale } = useLocale()
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border p-3 text-sm',
        reached ? 'border-warning/30 bg-warning/8' : 'border-border/60 bg-foreground/3 opacity-50',
      )}
    >
      <span className={cn('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold', reached ? 'bg-warning text-black' : 'bg-foreground/10')}>
        {reached ? '✓' : '?'}
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{localize(milestone.title, locale)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{localize(milestone.description, locale)}</p>
        <p className="mt-1 text-xs font-medium text-warning-fg/80">{localize(milestone.bonusLabel, locale)}</p>
      </div>
    </div>
  )
}

// ─── Node detail panel (slide-in) ────────────────────────────────────────────

function NodeDetailPanel({
  node,
  regionColor,
  onClose,
}: {
  node: GalaxyNode
  regionColor: string
  onClose: () => void
}) {
  const { nodeLevel, canUpgrade, upgradeNode, progress } = useGalaxy()
  const { locale, t } = useLocale()
  const level = nodeLevel(node.id)
  const isMaxed = level >= node.maxLevel
  const upgradeable = canUpgrade(node.id)
  const nextCost = node.levelCosts[level]?.toLocaleString(locale) ?? ''

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md"
            style={{ background: `${regionColor}33` }}
          >
            <NodeIcon type={node.type} className="h-5 w-5" color={regionColor} />
          </span>
          <div>
            <h2 className="font-semibold">{localize(node.title, locale)}</h2>
            <LevelDots level={level} max={node.maxLevel} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t('galaxyClosePanel')}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-muted-foreground">{localize(node.description, locale)}</p>

      {/* XP bar */}
      <div className="mb-4 rounded-md border border-border/60 bg-foreground/5 p-3">
        <p className="mb-1 text-xs text-muted-foreground">{t('galaxyYourXp')}</p>
        <p className="text-lg font-bold text-warning-fg">{progress.totalXp.toLocaleString(locale)} XP</p>
      </div>

      {/* Upgrade button */}
      {!isMaxed && (
        <button
          type="button"
          disabled={!upgradeable}
          onClick={() => upgradeNode(node.id)}
          className={cn(
            'mb-4 w-full rounded-md border px-4 py-3 text-sm font-semibold transition-all',
            upgradeable
              ? 'cursor-pointer border-success/40 bg-success/10 text-success-fg hover:bg-success/20'
              : 'cursor-not-allowed border-border/60 bg-foreground/5 text-muted-foreground',
          )}
        >
          {upgradeable
            ? t('galaxyUpgrade', { level: level + 1, cost: nextCost })
            : t('galaxyNeedXp', { level: level + 1, cost: nextCost })}
        </button>
      )}
      {isMaxed && (
        <div className="mb-4 w-full rounded-md border border-warning/30 bg-warning/8 px-4 py-3 text-center text-sm font-semibold text-warning-fg">
          {t('galaxyMaxLevelReached')}
        </div>
      )}

      {/* All level rewards */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('galaxyRewardsByLevel')}</p>
        {node.levelRewards.map((rewards, li) => {
          const reached = level > li
          const isNext = level === li
          return (
            <div
              key={li}
              className={cn(
                'rounded-lg border p-2.5 text-xs',
                reached ? 'border-warning/20 bg-warning/5' : isNext ? 'border-success/20 bg-success/5' : 'border-border/60 opacity-50',
              )}
            >
              <p className={cn('mb-1 font-semibold', reached ? 'text-warning-fg' : isNext ? 'text-success-fg' : 'text-foreground')}>
                {reached ? '✓' : isNext ? '→' : '○'} {t('galaxyLevel', { level: li + 1 })}
                {' '}
                <span className="font-normal text-muted-foreground">({node.levelCosts[li]?.toLocaleString(locale)} XP)</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {rewards.map((r, ri) => (
                  <span key={ri} className="rounded bg-foreground/10 px-1.5 py-0.5 text-2xs">
                    {r.type === 'xp' ? `+${r.amount.toLocaleString(locale)} XP` : localize(r.label, locale)}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Region panel ────────────────────────────────────────────────────────────

function RegionPanel({
  region,
  onNodeSelect,
}: {
  region: Region
  onNodeSelect: (node: GalaxyNode) => void
}) {
  const { regionMilestoneIndex } = useGalaxy()
  const { locale, t } = useLocale()
  const milestoneIndex = regionMilestoneIndex(region.id)

  // Authoring order (row, then column) maps onto however many columns fit.
  const ordered = [...region.nodes].sort((a, b) => a.position.row - b.position.row || a.position.col - b.position.col)

  return (
    <div className="space-y-5">
      {/* Entry lore */}
      <div className="rounded-lg border border-border/60 bg-foreground/3 p-4 text-sm italic text-muted-foreground">
        <Sparkles className="mb-2 h-4 w-4 text-warning-fg" />
        {localize(region.entryLore, locale)}
      </div>

      {/* Nodes grid */}
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-3">
        {ordered.map((node) => (
          <NodeCard key={node.id} node={node} regionColor={region.color} onSelect={onNodeSelect} />
        ))}
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('galaxyRegionMilestones')}</p>
        {region.milestones.map((ms, mi) => (
          <MilestoneBadge key={mi} milestone={ms} reached={milestoneIndex >= mi} />
        ))}
      </div>
    </div>
  )
}

// ─── Main Galaxy Map page ────────────────────────────────────────────────────

import { GALAXY_REGIONS } from './data'
import { playerLevel } from './levels'

export function GalaxyMapPage() {
  const { progress } = useGalaxy()
  const { locale, t } = useLocale()
  const [activeRegionId, setActiveRegionId] = useState<string>(GALAXY_REGIONS[0]!.id)
  const [selectedNode, setSelectedNode] = useState<GalaxyNode | null>(null)
  const isWide = useMediaQuery('(min-width: 1280px)')

  const activeRegion = GALAXY_REGIONS.find((r) => r.id === activeRegionId) ?? GALAXY_REGIONS[0]!
  const plvl = playerLevel(progress.totalXp)
  const detail = selectedNode ? (
    <NodeDetailPanel node={selectedNode} regionColor={activeRegion.color} onClose={() => setSelectedNode(null)} />
  ) : null

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('galaxyMap')}</h1>
          <p className="text-sm text-muted-foreground">{t('galaxySubtitle')}</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/8 px-4 py-2.5">
          <Star className="h-4 w-4 text-warning-fg" aria-hidden />
          <div>
            <p className="text-xs text-muted-foreground">{t('galaxyYourXp')}</p>
            <p className="font-bold tabular-nums text-warning-fg">{progress.totalXp.toLocaleString(locale)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('galaxyLevel', { level: plvl.level })}</p>
            <div className="mt-0.5 h-1.5 w-20 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full rounded-full bg-warning transition-all" style={{ width: `${plvl.pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {import.meta.env.DEV && <GalaxyXpDemo />}

      <div className="grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)] xl:grid-cols-[11rem_minmax(0,1fr)_20rem]">
        {/* Regions: scrollable chips on phones, a vertical list from lg. */}
        <nav aria-label={t('galaxyRegions')} className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {GALAXY_REGIONS.map((region) => (
            <button
              key={region.id}
              type="button"
              aria-pressed={region.id === activeRegionId}
              onClick={() => {
                setActiveRegionId(region.id)
                setSelectedNode(null)
              }}
              className={cn(
                'flex min-h-11 shrink-0 items-center gap-2.5 rounded-md border px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                region.id === activeRegionId
                  ? 'border-border bg-foreground/8 text-foreground'
                  : 'border-transparent text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
              )}
            >
              <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: region.color }} />
              <span className="truncate">{region.name}</span>
              <ChevronRight aria-hidden className={cn('ml-auto hidden h-3.5 w-3.5 shrink-0 opacity-0 lg:block', region.id === activeRegionId && 'opacity-60')} />
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          <div
            className="mb-4 flex items-center gap-3 rounded-lg border px-4 py-3"
            style={{ borderColor: `${activeRegion.color}44`, background: `${activeRegion.color}15` }}
          >
            <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: activeRegion.color }} />
            <div>
              <h2 className="font-semibold">{activeRegion.name}</h2>
              <p className="text-xs text-muted-foreground">{localize(activeRegion.country, locale)}</p>
            </div>
          </div>
          <RegionPanel region={activeRegion} onNodeSelect={setSelectedNode} />
        </div>

        {/* Node detail: sticky side panel on wide screens, bottom sheet below. */}
        {isWide ? (
          <aside aria-label={t('galaxyNodeDetails')} className="sticky top-header-offset max-h-[calc(100dvh-var(--fg-header-offset)-1rem)] self-start overflow-y-auto rounded-lg border border-border/60 bg-card p-5 shadow-fg-3">
            {detail ?? <p className="text-sm text-muted-foreground">{t('galaxySelectNode')}</p>}
          </aside>
        ) : (
          <DialogPrimitive.Root open={Boolean(selectedNode)} onOpenChange={(open) => !open && setSelectedNode(null)}>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/50 backdrop-blur-sm" />
              <DialogPrimitive.Content
                aria-describedby={undefined}
                className="fixed inset-x-0 bottom-0 z-modal max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-xl border-t border-border/60 bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-fg-5 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:inset-x-auto md:left-1/2 md:w-[32rem] md:-translate-x-1/2"
              >
                <DialogPrimitive.Title className="sr-only">{selectedNode ? localize(selectedNode.title, locale) : ''}</DialogPrimitive.Title>
                {detail}
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        )}
      </div>
    </div>
  )
}

// ─── Demo XP earn button ──────────────────────────────────────────────────────

function GalaxyXpDemo() {
  const { addXp } = useGalaxy()
  const { t } = useLocale()
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-foreground/3 px-4 py-3 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{t('galaxyDemoXp')}</span>
      {[50, 100, 250, 500].map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => addXp(amount)}
          className="min-h-9 rounded-md border border-border/60 bg-foreground/5 px-3 text-xs font-semibold transition hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          +{amount} XP
        </button>
      ))}
    </div>
  )
}
