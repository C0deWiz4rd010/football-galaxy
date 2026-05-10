import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { searchEntities } from '@/lib/explorer-data'

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchEntities(query), [query])

  const toggle = useCallback(
    (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpenChange(!open)
      }
    },
    [onOpenChange, open],
  )

  useKeyboardShortcut(['k'], toggle)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/70 bg-background/96 p-0 backdrop-blur-xl">
        <Command>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            className="border-b bg-transparent px-4 py-4 outline-none"
            placeholder="Search leagues, teams, players... Ctrl/Cmd+K"
          />
          <CommandList className="max-h-[28rem] overflow-y-auto p-2">
            <CommandEmpty className="p-4 text-sm text-muted-foreground">
              No matching leagues, teams, or players found.
            </CommandEmpty>

            <CommandGroup heading="Quick navigation">
              <CommandItem
                onSelect={() => {
                  navigate('/players')
                  onOpenChange(false)
                }}
              >
                Players Explorer
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  navigate('/teams')
                  onOpenChange(false)
                }}
              >
                Teams Explorer
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  navigate('/compare')
                  onOpenChange(false)
                }}
              >
                Compare Players
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading={`Leagues (${results.leagues.slice(0, 5).length})`}>
              {results.leagues.slice(0, 5).map((league) => (
                <CommandItem
                  key={league.id}
                  value={`${league.name} ${league.country}`}
                  onSelect={() => {
                    navigate(`/${league.id}`)
                    onOpenChange(false)
                  }}
                >
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-[10px] font-semibold">
                    {league.abbreviation}
                  </span>
                  <span>{league.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{league.country}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading={`Teams (${results.teams.slice(0, 8).length})`}>
              {results.teams.slice(0, 8).map(({ league, standing, team }) => (
                <CommandItem
                  key={team.id}
                  value={`${team.name} ${league.name}`}
                  onSelect={() => {
                    navigate(`/${team.leagueId}/team/${team.id}`)
                    onOpenChange(false)
                  }}
                >
                  <span>{team.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{league.abbreviation}</span>
                  {standing ? (
                    <span className="ml-auto text-xs text-muted-foreground">
                      #{standing.position}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading={`Players (${results.players.slice(0, 8).length})`}>
              {results.players.slice(0, 8).map(({ archetype, overall, player, team }) => (
                <CommandItem
                  key={player.id}
                  value={`${player.name} ${team.name} ${archetype}`}
                  onSelect={() => {
                    navigate(`/${player.leagueId}/player/${player.id}`)
                    onOpenChange(false)
                  }}
                >
                  <span>{player.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {player.position} - {team.shortName}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    OVR {overall}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
