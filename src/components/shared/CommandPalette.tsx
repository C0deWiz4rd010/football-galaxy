import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Loader2 } from 'lucide-react'

import { AssetImage } from '@/components/shared/AssetImage'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useLocale } from '@/contexts/LocaleContext'
import { MIN_SEARCH_LENGTH, useFootballSearch } from '@/hooks/queries/search'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { getLeague, leagues } from '@/lib/leagues'
import { createPlayerAvatar, createTeamCrest, initialsFromName } from '@/lib/visualAssets'

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate()
  const { t } = useLocale()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 250)
  const search = useFootballSearch(open ? debouncedQuery : '')
  const normalized = query.trim().toLowerCase()

  useKeyboardShortcut(['k'], (event) => {
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault()
      onOpenChange(!open)
    }
  })

  const go = useCallback(
    (to: string) => {
      navigate(to)
      onOpenChange(false)
      setQuery('')
    },
    [navigate, onOpenChange],
  )

  const navigation = useMemo(
    () => [
      { to: '/live', label: t('liveScores') },
      { to: '/players', label: t('playersExplorer') },
      { to: '/teams', label: t('teamsExplorer') },
      { to: '/compare', label: t('comparePlayers') },
      { to: '/world-cup-2026', label: t('worldCup2026') },
      { to: '/settings', label: t('settings') },
    ],
    [t],
  )

  const matches = (text: string) => !normalized || text.toLowerCase().includes(normalized)
  const navItems = navigation.filter((item) => matches(item.label))
  const leagueItems = leagues.filter((league) => matches(`${league.name} ${league.country}`))
  const teams = normalized.length >= MIN_SEARCH_LENGTH ? (search.data?.teams ?? []).slice(0, 6) : []
  const players = normalized.length >= MIN_SEARCH_LENGTH ? (search.data?.players ?? []).slice(0, 8) : []
  const isSearching = normalized.length >= MIN_SEARCH_LENGTH && (search.isFetching || debouncedQuery.trim().toLowerCase() !== normalized)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setQuery('')
      }}
    >
      <DialogContent className="overflow-hidden border-border/70 bg-background p-0">
        <div className="sr-only">
          <DialogTitle>{t('commandTitle')}</DialogTitle>
          <DialogDescription>{t('commandDescription')}</DialogDescription>
        </div>
        {/* Results come from the server, so cmdk's own fuzzy filter is off. */}
        <Command shouldFilter={false}>
          <div className="flex items-center border-b pr-4">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              className="w-full bg-transparent px-4 py-4 outline-none"
              placeholder={t('commandSearchPlaceholder')}
            />
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label={t('loading')} /> : null}
          </div>
          <CommandList className="max-h-[min(28rem,70dvh)] overflow-y-auto p-2">
            {!isSearching ? (
              <CommandEmpty className="p-4 text-sm text-muted-foreground">
                {search.isError ? t('searchUnavailable') : t('commandEmpty')}
              </CommandEmpty>
            ) : null}

            {navItems.length ? (
              <CommandGroup heading={t('quickNavigation')}>
                {navItems.map((item) => (
                  <CommandItem key={item.to} value={item.to} onSelect={() => go(item.to)}>
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {leagueItems.length ? (
              <CommandGroup heading={t('leaguesGroup', { count: leagueItems.length })}>
                {leagueItems.map((league) => (
                  <CommandItem key={league.id} value={`league-${league.id}`} onSelect={() => go(`/${league.id}`)}>
                    <AssetImage src={league.logo} fallbackSrc={createTeamCrest(league.abbreviation, league.color, "#f4f4f5", 0)} alt="" className="mr-2 h-6 w-6 object-contain" />
                    <span>{league.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{league.country}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {teams.length ? (
              <CommandGroup heading={t('teamsGroup', { count: teams.length })}>
                {teams.map((team) => (
                  <CommandItem key={team.id} value={`team-${team.id}`} onSelect={() => go(`/${team.leagueId}/team/${team.id}`)}>
                    <AssetImage
                      src={team.image ?? ''}
                      fallbackSrc={createTeamCrest(initialsFromName(team.name), getLeague(team.leagueId).color, '#f4f4f5', 0)}
                      alt=""
                      className="mr-2 h-6 w-6 object-contain"
                    />
                    <span>{team.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{getLeague(team.leagueId).name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {players.length ? (
              <CommandGroup heading={t('playersGroup', { count: players.length })}>
                {players.map((player) => (
                  <CommandItem key={player.id} value={`player-${player.id}`} onSelect={() => go(`/${player.leagueId}/player/${player.id}`)}>
                    <AssetImage
                      src={player.image ?? ''}
                      fallbackSrc={createPlayerAvatar(initialsFromName(player.name), getLeague(player.leagueId).color)}
                      alt=""
                      className="mr-2 h-6 w-6 rounded-full object-cover"
                    />
                    <span>{player.name}</span>
                    <span className="ml-auto truncate pl-2 text-xs text-muted-foreground">{player.subtitle ?? getLeague(player.leagueId).name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
