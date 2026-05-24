import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { AssetImage } from '@/components/shared/AssetImage'
import { getCrestSources, getPlayerPhotoSources } from '@/lib/assetSources'
import { createPlayerAvatar, createTeamCrest, initialsFromName } from '@/lib/visualAssets'
import type { Player, Team } from '@/services/types'

export function PlayerHeader({ player, team, action, backButton }: { player: Player; team?: Team; action?: React.ReactNode; backButton?: React.ReactNode }) {
  const playerFallback = createPlayerAvatar(initialsFromName(player.name), team?.primaryColor ?? '#0f766e')
  return (
    <section className="stat-card relative p-4">
      {backButton && (
        <div className="absolute left-3 top-3 z-10">{backButton}</div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <AssetImage src={player.photo} fallbackSrc={[...getPlayerPhotoSources(player), playerFallback]} alt={player.name} className="h-24 w-24 rounded-[1.35rem] object-cover ring-2" style={{ '--tw-ring-color': team?.primaryColor ?? 'hsl(var(--primary))' } as React.CSSProperties} loading="lazy" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md px-2.5 py-1 font-mono text-xl font-bold text-white" style={{ backgroundColor: team?.primaryColor ?? '#18181b' }}>{player.number}</span>
            <Badge>{player.position}</Badge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{player.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <img src={player.flag} alt={`${player.nationality} flag`} className="h-4 w-6 rounded-sm object-cover" loading="lazy" />
            <span>{player.nationality} | {player.age} years | {player.heightCm} cm | {player.weightKg} kg</span>
          </p>
          {team ? (
            <Link
              to={`/${team.leagueId}/team/${team.id}`}
              className="mt-2 inline-flex items-center gap-2 text-sm font-medium hover:text-primary"
            >
              <AssetImage src={team.crest} fallbackSrc={[...getCrestSources(team), createTeamCrest(team.shortName, team.primaryColor ?? '#0f766e', team.secondaryColor ?? '#f8fafc', 0)]} alt={team.name} className="h-8 w-8 rounded object-cover" loading="lazy" />
              <span>{team.name}</span>
            </Link>
          ) : null}
        </div>
        {action}
      </div>
    </section>
  )
}
