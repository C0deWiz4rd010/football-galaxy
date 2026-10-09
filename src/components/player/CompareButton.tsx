import { SplitSquareHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import type { LeagueId } from '@/services/types'

/** Inline page action; no floating button that would cover content on phones. */
export function CompareButton({ playerId, leagueId }: { playerId: string; leagueId: LeagueId }) {
  const { t } = useLocale()
  return (
    <Button asChild variant="outline" className="h-11 gap-2 px-4">
      <Link to={`/compare?p1=${encodeURIComponent(playerId)}&l1=${leagueId}`}>
        <SplitSquareHorizontal className="h-4 w-4" aria-hidden />
        <span>{t('compare')}</span>
      </Link>
    </Button>
  )
}
