import { memo, useState } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Lock, Sparkles, Star, Trophy, Swords, Users, Zap } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { GalaxyNode, NodeType, Region, RegionMilestone } from './types'
import { useGalaxy } from './context'

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
            i < level ? 'bg-amber-400' : 'bg-white/20',
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
  const level = nodeLevel(node.id)
  const isMaxed = level >= node.maxLevel
  const upgradeable = canUpgrade(node.id)
  const isLocked = level === 0 && !upgradeable

  return (
    <motion.button
      type="button"
      layout
      onClick={() => onSelect(node)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative flex flex-col gap-2 rounded-2xl border p-3 text-left transition-all',
        isMaxed && 'border-amber-400/40 bg-amber-400/5',
        !isMaxed && upgradeable && 'border-emerald-400/40 bg-emerald-400/5 cursor-pointer',
        !isMaxed && !upgradeable && !isLocked && 'border-white/10 bg-white/3 cursor-pointer',
        isLocked && 'border-white/5 bg-white/2 cursor-pointer opacity-60',
      )}
    >
      {/* level glow ring when upgradeable */}
      {upgradeable && !isMaxed && (
        <span className="absolute inset-0 animate-pulse rounded-2xl ring-1 ring-emerald-400/30" />
      )}

      <div className="flex items-center justify-between gap-2">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl"
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
        <p className="truncate text-sm font-semibold">{node.title}</p>
        <p className="line-clamp-2 mt-0.5 text-xs text-muted-foreground">{node.description}</p>
      </div>

      {!isLocked && !isMaxed && (
        <p className="mt-auto text-xs font-medium" style={{ color: upgradeable ? '#34d399' : '#f59e0b' }}>
          {upgradeable
            ? `↑ Upgrade to Lv.${level + 1} — costs ${node.levelCosts[level]?.toLocaleString()} XP`
            : `Lv.${level + 1} needs ${node.levelCosts[level]?.toLocaleString()} XP`}
        </p>
      )}
      {isMaxed && (
        <p className="mt-auto text-xs font-semibold text-amber-400">★ Max Level</p>
      )}
    </motion.button>
  )
}

// ─── Milestone badge ─────────────────────────────────────────────────────────

function MilestoneBadge({ milestone, reached }: { milestone: RegionMilestone; reached: boolean }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3 text-sm',
        reached ? 'border-amber-400/30 bg-amber-400/8' : 'border-white/8 bg-white/3 opacity-50',
      )}
    >
      <span className={cn('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold', reached ? 'bg-amber-400 text-black' : 'bg-white/10')}>
        {reached ? '✓' : '?'}
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{milestone.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{milestone.description}</p>
        <p className="mt-1 text-xs font-medium text-amber-400/80">{milestone.bonusLabel}</p>
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
  const level = nodeLevel(node.id)
  const isMaxed = level >= node.maxLevel
  const upgradeable = canUpgrade(node.id)
  const nextCost = node.levelCosts[level]

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="flex h-full flex-col overflow-y-auto rounded-2xl border border-white/10 bg-background/95 p-5 shadow-2xl"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ background: `${regionColor}33` }}
          >
            <NodeIcon type={node.type} className="h-5 w-5" color={regionColor} />
          </span>
          <div>
            <h3 className="font-semibold">{node.title}</h3>
            <LevelDots level={level} max={node.maxLevel} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-muted-foreground">{node.description}</p>

      {/* XP bar */}
      <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="mb-1 text-xs text-muted-foreground">Your XP</p>
        <p className="text-lg font-bold text-amber-400">{progress.totalXp.toLocaleString()} XP</p>
      </div>

      {/* Upgrade button */}
      {!isMaxed && (
        <button
          type="button"
          disabled={!upgradeable}
          onClick={() => upgradeNode(node.id)}
          className={cn(
            'mb-4 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition-all',
            upgradeable
              ? 'cursor-pointer border-emerald-400/40 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20'
              : 'cursor-not-allowed border-white/10 bg-white/5 text-muted-foreground',
          )}
        >
          {upgradeable
            ? `Upgrade to Level ${level + 1} — ${nextCost?.toLocaleString()} XP`
            : `Need ${nextCost?.toLocaleString()} XP for Level ${level + 1}`}
        </button>
      )}
      {isMaxed && (
        <div className="mb-4 w-full rounded-xl border border-amber-400/30 bg-amber-400/8 px-4 py-3 text-center text-sm font-semibold text-amber-400">
          ★ Max Level Reached
        </div>
      )}

      {/* All level rewards */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rewards by Level</p>
        {node.levelRewards.map((rewards, li) => {
          const reached = level > li
          const isNext = level === li
          return (
            <div
              key={li}
              className={cn(
                'rounded-lg border p-2.5 text-xs',
                reached ? 'border-amber-400/20 bg-amber-400/5' : isNext ? 'border-emerald-400/20 bg-emerald-400/5' : 'border-white/8 opacity-50',
              )}
            >
              <p className={cn('mb-1 font-semibold', reached ? 'text-amber-400' : isNext ? 'text-emerald-400' : 'text-foreground')}>
                {reached ? '✓' : isNext ? '→' : '○'} Level {li + 1}
                {' '}
                <span className="font-normal text-muted-foreground">({node.levelCosts[li]?.toLocaleString()} XP)</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {rewards.map((r, ri) => (
                  <span key={ri} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">{r.label}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
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
  const milestoneIndex = regionMilestoneIndex(region.id)

  // Build a 3-col grid
  const cols = 3
  const rows = Math.ceil(region.nodes.length / cols)
  const grid: Array<GalaxyNode | null> = Array.from({ length: cols * rows }, () => null)
  for (const node of region.nodes) {
    const idx = node.position.row * cols + node.position.col
    if (idx >= 0 && idx < grid.length) grid[idx] = node
  }

  return (
    <div className="space-y-5">
      {/* Entry lore */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-4 text-sm italic text-muted-foreground">
        <Sparkles className="mb-2 h-4 w-4 text-amber-400" />
        {region.entryLore}
      </div>

      {/* Nodes grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
      >
        {grid.map((node, i) =>
          node ? (
            <NodeCard
              key={node.id}
              node={node}
              regionColor={region.color}
              onSelect={onNodeSelect}
            />
          ) : (
            <div key={i} />
          ),
        )}
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Region Milestones</p>
        {region.milestones.map((ms, mi) => (
          <MilestoneBadge key={mi} milestone={ms} reached={milestoneIndex >= mi} />
        ))}
      </div>
    </div>
  )
}

// ─── Main Galaxy Map page ────────────────────────────────────────────────────

import { GALAXY_REGIONS } from './data'
import { playerLevel } from './context'

export function GalaxyMapPage() {
  const { progress } = useGalaxy()
  const [activeRegionId, setActiveRegionId] = useState<string>(GALAXY_REGIONS[0]!.id)
  const [selectedNode, setSelectedNode] = useState<GalaxyNode | null>(null)

  const activeRegion = GALAXY_REGIONS.find((r) => r.id === activeRegionId) ?? GALAXY_REGIONS[0]!
  const plvl = playerLevel(progress.totalXp)

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Galaxy Map</h1>
          <p className="text-sm text-muted-foreground">Unlock nodes, level up, discover lore across all 5 regions.</p>
        </div>
        {/* XP widget */}
        <div className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/8 px-4 py-2.5">
          <Star className="h-4 w-4 text-amber-400" />
          <div>
            <p className="text-xs text-muted-foreground">Your XP</p>
            <p className="font-bold text-amber-400">{progress.totalXp.toLocaleString()}</p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground">Level {plvl.level}</p>
            <div className="mt-0.5 h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${plvl.pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Demo XP buttons */}
      <GalaxyXpDemo />

      {/* Layout: region tabs + content + optional node panel */}
      <div className="flex min-h-0 flex-1 gap-4">
        {/* Region tabs */}
        <nav className="flex w-44 shrink-0 flex-col gap-1">
          {GALAXY_REGIONS.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => { setActiveRegionId(region.id); setSelectedNode(null) }}
              className={cn(
                'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all',
                region.id === activeRegionId
                  ? 'border-white/15 bg-white/8 text-foreground'
                  : 'border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground',
              )}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: region.color }}
              />
              <span className="truncate">{region.name}</span>
              <ChevronRight className={cn('ml-auto h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity', region.id === activeRegionId && 'opacity-60')} />
            </button>
          ))}
        </nav>

        {/* Main region content */}
        <div className="flex min-w-0 flex-1 gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRegionId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="min-w-0 flex-1 overflow-y-auto"
            >
              {/* Region header */}
              <div
                className="mb-4 flex items-center gap-3 rounded-2xl border px-4 py-3"
                style={{ borderColor: `${activeRegion.color}44`, background: `${activeRegion.color}15` }}
              >
                <span className="h-3 w-3 rounded-full" style={{ background: activeRegion.color }} />
                <div>
                  <p className="font-semibold">{activeRegion.name}</p>
                  <p className="text-xs text-muted-foreground">{activeRegion.country}</p>
                </div>
              </div>
              <RegionPanel region={activeRegion} onNodeSelect={setSelectedNode} />
            </motion.div>
          </AnimatePresence>

          {/* Node detail panel */}
          <div className={cn('w-72 shrink-0 transition-all', selectedNode ? 'opacity-100' : 'pointer-events-none opacity-0')}>
            <AnimatePresence>
              {selectedNode && (
                <NodeDetailPanel
                  key={selectedNode.id}
                  node={selectedNode}
                  regionColor={activeRegion.color}
                  onClose={() => setSelectedNode(null)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Demo XP earn button ──────────────────────────────────────────────────────

function GalaxyXpDemo() {
  const { addXp } = useGalaxy()
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">Demo — earn XP:</span>
      {[50, 100, 250, 500].map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => addXp(amount)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold transition hover:bg-white/10"
        >
          +{amount} XP
        </button>
      ))}
    </div>
  )
}
