import { TopScorersCard } from './TopScorersCard'
import { useLocale } from '@/contexts/LocaleContext'
import type { Assist } from '@/services/types'

export function TopAssistsCard({ items }: { items: Assist[] }) {
  const { t } = useLocale()
  return <TopScorersCard title={t('topAssists')} items={items} type="assists" />
}
