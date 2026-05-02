import { memo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useNavigate } from 'react-router-dom'
import { AssetImage } from '@/components/shared/AssetImage'
import { createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { Assist, Scorer } from '@/services/types'

type Item = Scorer | Assist

const ScorersItem = memo(function ScorersItem({ item, value, label }: { item: Item; value: number; label: string }) {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(`/${item.player.leagueId}/player/${item.player.id}`)} className="mr-3 min-w-[13rem] max-w-[13rem] rounded-lg border bg-background p-4 text-left transition hover:bg-muted/40 sm:min-w-52 sm:max-w-52">
      <div className="relative mb-3 h-12 w-12">
        <AssetImage src={item.player.photo} fallbackSrc={createPlayerAvatar(initialsFromName(item.player.name), item.team.primaryColor ?? '#0f766e')} alt={item.player.name} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
        <span className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
          <img src={item.player.flag} alt={`${item.player.nationality} flag`} className="h-4 w-5 rounded-sm object-cover" loading="lazy" />
        </span>
      </div>
      <p className="truncate font-semibold">{item.player.name}</p>
      <p className="text-xs text-muted-foreground">{item.team.shortName}</p>
      <p className="mt-3 font-mono text-2xl font-bold sm:text-3xl">{value}<span className="ml-1 text-xs font-sans font-normal text-muted-foreground">{label}</span></p>
    </button>
  )
})

export function TopScorersCard({ title, items, type = 'goals' }: { title: string; items: Item[]; type?: 'goals' | 'assists' }) {
  const [ref] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' })
  return (
    <section className="stat-card overflow-hidden">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      <div ref={ref}>
        <div className="flex">
          {items.map((item) => <ScorersItem key={item.id} item={item} value={type === 'goals' ? item.goals : item.assists} label={type} />)}
        </div>
      </div>
    </section>
  )
}
