import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { mockData } from '@/data/mock'

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const teams = useMemo(() => Object.values(mockData).flatMap((league) => league.teams), [])
  const players = useMemo(() => teams.flatMap((team) => team.squad ?? []).slice(0, 120), [teams])
  const normalized = query.toLowerCase()
  const filteredTeams = normalized.length >= 1 ? teams.filter((team) => team.name.toLowerCase().includes(normalized)).slice(0, 8) : []
  const filteredPlayers = normalized.length >= 1 ? players.filter((player) => player.name.toLowerCase().includes(normalized)).slice(0, 8) : []

  const toggle = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      onOpenChange(!open)
    }
  }, [onOpenChange, open])
  useKeyboardShortcut(['k'], toggle)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <Command>
          <CommandInput value={query} onValueChange={setQuery} className="border-b bg-transparent px-4 py-3 outline-none" placeholder="Search teams and players... ⌘K" />
          <CommandList className="max-h-96 overflow-y-auto p-2">
            <CommandEmpty className="p-4 text-sm text-muted-foreground">No results found.</CommandEmpty>
            <CommandGroup heading="Teams">
              {filteredTeams.map((team) => (
                <CommandItem key={team.id} value={team.name} onSelect={() => { navigate(`/${team.leagueId}/team/${team.id}`); onOpenChange(false) }}>
                  <img src={team.crest} alt="" className="mr-2 h-5 w-5 rounded" /> {team.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Players">
              {filteredPlayers.map((player) => (
                <CommandItem key={player.id} value={player.name} onSelect={() => { navigate(`/${player.leagueId}/player/${player.id}`); onOpenChange(false) }}>
                  <img src={player.photo} alt="" className="mr-2 h-5 w-5 rounded-full" /> {player.name}
                  <span className="ml-2 text-xs text-muted-foreground">{player.position}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
