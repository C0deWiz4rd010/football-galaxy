import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { AssetImage } from '@/components/shared/AssetImage'
import { getCrestSources, getPlayerPhotoSources } from '@/lib/assetSources'
import { createPlayerAvatar, createTeamCrest, initialsFromName } from '@/lib/visualAssets'
import type { Player, Team } from '@/services/types'

export function PlayerHeader({ player, team, action }: { player: Player; team?: Team; action?: React.ReactNode }) {
  const playerFallback = createPlayerAvatar(initialsFromName(player.name), team?.primaryColor ?? '#0f766e')
  return (
    <section className="stat-card flex flex-col gap-5 sm:flex-row sm:items-center">
      <AssetImage src={player.photo} fallbackSrc={[...getPlayerPhotoSources(player), playerFallback]} alt={player.name} className="h-28 w-28 rounded-full object-cover ring-4" style={{ '--tw-ring-color': team?.primaryColor ?? 'hsl(var(--primary))' } as React.CSSProperties} loading="lazy" />
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="rounded-md px-3 py-1 font-mono text-2xl font-bold text-white" style={{ backgroundColor: team?.primaryColor ?? '#18181b' }}>{player.number}</span>
          <Badge>{player.position}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{player.name}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
          <img src={player.flag} alt={`${player.nationality} flag`} className="h-4 w-6 rounded-sm object-cover" loading="lazy" />
          <span>{player.nationality} | {player.age} years | {player.heightCm} cm | {player.weightKg} kg</span>
        </p>
        {team ? (
          <Link
            to={`/${team.leagueId}/team/${team.id}`}
            className="mt-2 inline-flex items-center gap-2 text-sm hover:text-primary"
          >
            <AssetImage src={team.crest} fallbackSrc={[...getCrestSources(team), createTeamCrest(team.shortName, team.primaryColor ?? '#0f766e', team.secondaryColor ?? '#f8fafc', 0)]} alt={team.name} className="h-8 w-8 rounded object-cover" loading="lazy" />
            <span>{team.name}</span>
          </Link>
        ) : null}
      </div>
      {action}
    </section>
  )
}
