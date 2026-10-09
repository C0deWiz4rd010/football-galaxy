import { Shield, Star, Users, X } from 'lucide-react'
import { useId } from 'react'
import { Link } from 'react-router-dom'

import { useLocale } from '@/contexts/LocaleContext'
import { useFavorites } from '@/hooks/useFavorites'

/** Followed clubs and players (sidebar and mobile menu). */
export function FavoritesList({ limit = 3, onNavigate }: { limit?: number; onNavigate?: () => void }) {
  const favorites = useFavorites()
  const headingId = useId()
  const { t } = useLocale()
  const total = favorites.teams.length + favorites.players.length
  const entries = [
    ...favorites.teams.slice(0, limit).map((item) => ({ ...item, kind: 'team' as const })),
    ...favorites.players.slice(0, limit).map((item) => ({ ...item, kind: 'player' as const })),
  ]

  return (
    <section className="surface-soft rounded-md p-2.5" aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-1.5 flex items-center gap-2 text-2xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
        <Star className="h-3.5 w-3.5 text-warning-fg" aria-hidden /> {t('favorites')}
        {total > 0 ? (
          <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-semibold text-primary">{total}</span>
        ) : null}
      </h2>
      {total === 0 ? (
        <div className="rounded-sm border border-dashed border-border/60 px-2.5 py-2 text-2xs text-muted-foreground">
          <p className="font-medium text-foreground/80">{t('favoritesEmpty')}</p>
          <p className="mt-0.5 line-clamp-2">{t('favoritesEmptyHint')}</p>
        </div>
      ) : (
        <ul className="space-y-0.5">
          {entries.map((item) => {
            const Icon = item.kind === 'team' ? Shield : Users
            return (
              <li key={`${item.kind}-${item.id}`} className="group flex items-center gap-1">
                <Link
                  to={`/${item.leagueId}/${item.kind}/${item.id}`}
                  onClick={onNavigate}
                  className="flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-sm px-1.5 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  <span className="truncate">{item.name}</span>
                </Link>
                <button
                  type="button"
                  aria-label={`${t('removeFavorite')}: ${item.name}`}
                  title={t('removeFavorite')}
                  onClick={() => (item.kind === 'team' ? favorites.removeTeam(item.id) : favorites.removePlayer(item.id))}
                  className="flex size-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-opacity hover:text-danger-fg focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
