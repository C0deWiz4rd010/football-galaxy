import { Badge } from '@/components/ui/badge'
import { useAppMode } from '@/hooks/useAppMode'
import { getPlayerCardProfile } from '@/lib/player-ratings'
import { createPlayerAvatar, createTeamCrest, initialsFromName } from '@/lib/visualAssets'
import { AssetImage } from '@/components/shared/AssetImage'
import type { Player, Team } from '@/services/types'

export function PlayerEaCard({
  player,
  team,
}: {
  player: Player
  team?: Team
}) {
  const { mode } = useAppMode()
  const profile = getPlayerCardProfile(player)
  const accent = team?.primaryColor ?? '#0f766e'

  return (
    <section className="stat-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {mode === 'ea-fc' ? 'Primary mode view' : 'Card projection'}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">EA FC Style Card</h2>
        </div>
        <Badge variant="outline">{profile.tier}</Badge>
      </div>

      <div
        className="relative overflow-hidden rounded-[1.8rem] border border-white/12 p-5"
        style={{
          background: `linear-gradient(155deg, ${accent}55, rgba(244, 180, 56, 0.18) 48%, rgba(13, 20, 35, 0.7) 100%)`,
        }}
      >
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex flex-col items-center">
            <div className="rounded-[1.5rem] border border-white/15 bg-black/18 px-4 py-3 text-center">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/80">OVR</p>
              <p className="text-5xl font-black text-white">{profile.overall}</p>
              <p className="text-xs font-medium text-white/75">{player.position}</p>
            </div>
            <AssetImage
              src={player.photo}
              fallbackSrc={createPlayerAvatar(initialsFromName(player.name), accent)}
              alt={player.name}
              className="mt-4 h-24 w-24 rounded-[1.6rem] object-cover ring-2 ring-white/15"
              loading="lazy"
            />
          </div>

          <div className="min-w-0 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/20 bg-black/15 text-white">{player.position}</Badge>
              <Badge className="border-white/20 bg-black/15 text-white">{profile.archetype}</Badge>
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{player.name}</h3>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/75">
              {team ? (
                <span className="inline-flex items-center gap-2">
                  <AssetImage
                    src={team.crest}
                    fallbackSrc={createTeamCrest(
                      team.shortName,
                      team.primaryColor ?? '#0f766e',
                      team.secondaryColor ?? '#f8fafc',
                      0,
                    )}
                    alt={team.name}
                    className="h-6 w-6 rounded-lg object-cover"
                    loading="lazy"
                  />
                  {team.shortName}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <img
                  src={player.flag}
                  alt={`${player.nationality} flag`}
                  className="h-4 w-6 rounded-sm object-cover"
                  loading="lazy"
                />
                {player.nationality}
              </span>
              <span>No. {player.number}</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">PAC</p>
                <p className="text-xl font-semibold">{profile.attributes.pace}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">SHO</p>
                <p className="text-xl font-semibold">{profile.attributes.shooting}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">PAS</p>
                <p className="text-xl font-semibold">{profile.attributes.passing}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">DRI</p>
                <p className="text-xl font-semibold">{profile.attributes.dribbling}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">DEF</p>
                <p className="text-xl font-semibold">{profile.attributes.defending}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">PHY</p>
                <p className="text-xl font-semibold">{profile.attributes.physical}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        App-generated rating based on available stats and position weighting. This is a Football Galaxy interpretation, not an official EA rating.
      </p>
    </section>
  )
}
