import { memo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AssetImage } from '@/components/shared/AssetImage'
import { createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { Assist, Scorer } from '@/services/types'

type Item = Scorer | Assist

const ScorersItem = memo(function ScorersItem({ item, value, label }: { item: Item; value: number; label: string }) {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(`/${item.player.leagueId}/player/${item.player.id}`)} className="surface-soft mr-3 min-w-[13.5rem] max-w-[13.5rem] rounded-[1.4rem] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10 sm:min-w-56 sm:max-w-56">
      <div className="relative mb-3 h-12 w-12">
        <AssetImage src={item.player.photo} fallbackSrc={createPlayerAvatar(initialsFromName(item.player.name), item.team.primaryColor ?? '#0f766e')} alt={item.player.name} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
        <span className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
          <img src={item.player.flag} alt={`${item.player.nationality} flag`} className="h-4 w-5 rounded-sm object-cover" loading="lazy" />
        </span>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{item.player.name}</p>
          <p className="text-xs text-muted-foreground">{item.team.shortName}</p>
        </div>
        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <p className="mt-4 font-mono text-2xl font-bold sm:text-3xl">{value}<span className="ml-1 text-xs font-sans font-normal uppercase tracking-[0.16em] text-muted-foreground">{label}</span></p>
    </button>
  )
})

export function TopScorersCard({ title, items, type = 'goals' }: { title: string; items: Item[]; type?: 'goals' | 'assists' }) {
  const [ref] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' })
  return (
    <section className="stat-card overflow-hidden">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Leaders</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        <span className="text-xs text-muted-foreground">Swipe or scroll</span>
      </div>
      <div ref={ref}>
        <div className="flex">
          {items.map((item) => <ScorersItem key={item.id} item={item} value={type === 'goals' ? item.goals : item.assists} label={type} />)}
        </div>
      </div>
    </section>
  )
}
