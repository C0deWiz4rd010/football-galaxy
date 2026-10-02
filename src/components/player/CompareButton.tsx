import { SplitSquareHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import type { LeagueId } from '@/services/types'

export function CompareButton({ playerId, leagueId }: { playerId: string; leagueId: LeagueId }) {
  const { t } = useLocale()
  return (
    <Button
      asChild
      variant="outline"
      className="fab fixed right-5 z-50 h-14 w-14 rounded-full p-0 md:static md:z-auto md:h-10 md:w-auto md:px-4"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5.75rem)' }}
    >
      <Link to={`/compare?p1=${encodeURIComponent(playerId)}&l1=${leagueId}`} aria-label={t('comparePlayers')}>
        <SplitSquareHorizontal className="h-5 w-5" aria-hidden />
        <span className="hidden md:inline">{t('compare')}</span>
      </Link>
    </Button>
  )
}
