import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import { getCrestSources } from '@/lib/assetSources'
import { formatDateTime } from '@/lib/utils'
import { createTeamCrest } from '@/lib/visualAssets'
import type { Match } from '@/services/types'

export function MatchOfTheDay({ match }: { match?: Match }) {
  const [open, setOpen] = useState(false)
  const { t } = useLocale()

  if (!match) {
    return (
      <section className="stat-card">
        <EmptyState
          title={t('noFeaturedMatch')}
          description={t('noMatchContextAvailable')}
          className="min-h-0 border-0 p-0"
        />
      </section>
    )
  }

  const isTodayLive = match.status === 'LIVE'

  return (
    <section className="stat-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('matchCenter')}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('matchOfTheDay')}</h2>
        </div>
        {isTodayLive ? (
          <Badge className="border-red-500/30 bg-red-500/15 text-red-500">LIVE</Badge>
        ) : (
          <Badge variant="outline">{match.status}</Badge>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <Link to={`/${match.leagueId}/team/${match.homeTeam.id}`} className="group">
          <AssetImage
            src={match.homeTeam.crest}
            fallbackSrc={[
              ...getCrestSources(match.homeTeam),
              createTeamCrest(
                match.homeTeam.shortName,
                match.homeTeam.primaryColor ?? '#0f766e',
                match.homeTeam.secondaryColor ?? '#f8fafc',
                0,
              ),
            ]}
            alt={match.homeTeam.name}
            className="mx-auto h-16 w-16 rounded-2xl object-cover transition group-hover:scale-[1.02]"
            loading="lazy"
          />
          <p className="mt-2 text-sm font-medium">{match.homeTeam.shortName}</p>
        </Link>
        <div className="rounded-fg-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-4xl font-bold">
          {match.homeScore ?? '-'}-{match.awayScore ?? '-'}
        </div>
        <Link to={`/${match.leagueId}/team/${match.awayTeam.id}`} className="group">
          <AssetImage
            src={match.awayTeam.crest}
            fallbackSrc={[
              ...getCrestSources(match.awayTeam),
              createTeamCrest(
                match.awayTeam.shortName,
                match.awayTeam.primaryColor ?? '#0f766e',
                match.awayTeam.secondaryColor ?? '#f8fafc',
                1,
              ),
            ]}
            alt={match.awayTeam.name}
            className="mx-auto h-16 w-16 rounded-2xl object-cover transition group-hover:scale-[1.02]"
            loading="lazy"
          />
          <p className="mt-2 text-sm font-medium">{match.awayTeam.shortName}</p>
        </Link>
      </div>

      <div className="mt-4 rounded-fg-lg border border-white/8 bg-white/4 px-4 py-3 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {t('kickoffAndVenue')}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateTime(match.utcDate)} — {match.venue ?? t('venuePending')}
        </p>
      </div>

      <Button variant="outline" className="mt-4 w-full" onClick={() => setOpen((value) => !value)}>
        {open ? t('hideEvents') : t('viewEvents')}
      </Button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.ol
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="mt-4 space-y-2 overflow-hidden"
          >
            {match.events.length > 0 ? (
              match.events.map((event) => (
                <li key={event.id} className="surface-soft rounded-xl px-3 py-2 text-sm">
                  <span className="font-mono">{event.minute}'</span> {event.type} —{' '}
                  {event.playerId ? (
                    <Link
                      to={`/${match.leagueId}/player/${event.playerId}`}
                      className="font-medium hover:text-primary"
                    >
                      {event.playerName}
                    </Link>
                  ) : (
                    event.playerName
                  )}
                </li>
              ))
            ) : (
              <li className="surface-soft rounded-xl px-3 py-2 text-sm text-muted-foreground">
                {t('noEventTimeline')}
              </li>
            )}
          </motion.ol>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
