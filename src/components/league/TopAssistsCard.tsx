import { TopScorersCard } from './TopScorersCard'
import type { Assist } from '@/services/types'

export function TopAssistsCard({ items }: { items: Assist[] }) {
  return <TopScorersCard title="Top Assists" items={items} type="assists" />
}
