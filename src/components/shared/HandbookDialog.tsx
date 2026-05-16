/**
 * `HandbookDialog` is the in-app user manual. It opens as a modal with a
 * left sidenav (sections) and a right-hand content pane. Sections are pure
 * content blocks so they're trivial to extend without touching layout.
 */

import { useState } from 'react'

import {
  BarChart3,
  BookOpen,
  Compass,
  Globe2,
  Keyboard,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Section = {
  id: string
  label: string
  icon: typeof BookOpen
  render: () => JSX.Element
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-6 text-muted-foreground">{children}</p>
}

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold tracking-tight text-foreground">{children}</h3>
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="surface-soft rounded-fg-md border border-border/60 p-3 text-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tip</p>
      <p className="mt-1 text-foreground">{children}</p>
    </div>
  )
}

const sections: Section[] = [
  {
    id: 'overview',
    label: 'Welcome',
    icon: BookOpen,
    render: () => (
      <div className="space-y-4">
        <H>Welcome to Football Galaxy</H>
        <P>
          Football Galaxy is a fast, live‑data dashboard for the top five European leagues
          (Premier League, La Liga, Bundesliga, Serie A, Ligue 1). Every screen blends
          real season numbers with editorial cards so you can move from league overview
          to a single player in two clicks.
        </P>
        <Tip>
          Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Cmd</kbd>/
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Ctrl</kbd> +
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">K</kbd> from
          anywhere to open the search command palette.
        </Tip>
      </div>
    ),
  },
  {
    id: 'dashboard',
    label: 'League Dashboard',
    icon: Layers,
    render: () => (
      <div className="space-y-4">
        <H>League Dashboard</H>
        <P>
          The league dashboard is the main entry for each competition. The hero block
          shows the league logo, the current matchday and four headline stats:
          leaders, average goals, clean sheets, and form leader.
        </P>
        <P>
          Below the hero you&rsquo;ll find the full standings table, four storyline
          cards (rising team, playmaker of the week, defensive anchor, explorer
          shortcut), the next/last match of the day, and the form table.
        </P>
        <Tip>Click any team row to open the full club page with squad and form trend.</Tip>
      </div>
    ),
  },
  {
    id: 'teams',
    label: 'Teams & Players',
    icon: ShieldCheck,
    render: () => (
      <div className="space-y-4">
        <H>Team & Player Pages</H>
        <P>
          The team page combines club identity (manager, stadium, market value), the
          full squad table sorted by form, recent results, and shape charts. Click
          the heart icon to follow a team — it then appears in the sidebar
          favorites list.
        </P>
        <P>
          The player page surfaces a form score, attribute radar, season production,
          scouting notes, and recent club matches for context.
        </P>
      </div>
    ),
  },
  {
    id: 'explorers',
    label: 'Explorers',
    icon: Users,
    render: () => (
      <div className="space-y-4">
        <H>Teams &amp; Players Explorers</H>
        <P>
          The two explorer pages are flat directories across all five leagues. Use the
          search box for free‑text matches and the league pills to scope results.
          Sort by table position, points, goals, assists, or form.
        </P>
        <Tip>
          The Players explorer is capped at the top 48 results to stay snappy — refine
          the search to surface the exact player.
        </Tip>
      </div>
    ),
  },
  {
    id: 'compare',
    label: 'Compare',
    icon: BarChart3,
    render: () => (
      <div className="space-y-4">
        <H>Compare Players</H>
        <P>
          Pick two players from anywhere in the top 5 and we&rsquo;ll line up their
          season production, attribute radar, and a per‑metric head‑to‑head table.
          The selected pair is preserved in the URL so you can share the comparison.
        </P>
      </div>
    ),
  },
  {
    id: 'galaxy',
    label: 'Galaxy Map',
    icon: Globe2,
    render: () => (
      <div className="space-y-4">
        <H>Galaxy Map</H>
        <P>
          The Galaxy Map is the playful, browser‑game side of Football Galaxy. Spend
          XP on rival, trophy, legend and challenge nodes inside each league region
          to unlock milestone bonuses. Progress is saved locally to your device.
        </P>
      </div>
    ),
  },
  {
    id: 'data',
    label: 'Data Sources',
    icon: Compass,
    render: () => (
      <div className="space-y-4">
        <H>Where the data comes from</H>
        <P>
          Live numbers come from a cascade: football‑data.org first (standings,
          scorers, assists, matches), TheSportsDB second (crests, badges, player
          photos), and a curated mock dataset last so the app always renders.
        </P>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">football‑data.org</Badge>
          <Badge variant="outline">TheSportsDB</Badge>
          <Badge variant="outline">ESPN</Badge>
          <Badge variant="outline">Mock data</Badge>
        </div>
        <Tip>
          The header toggle lets you switch the live source on or off — useful for
          inspecting the seeded mock dataset offline.
        </Tip>
      </div>
    ),
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    icon: Keyboard,
    render: () => (
      <div className="space-y-4">
        <H>Keyboard Shortcuts</H>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Cmd</kbd>/
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Ctrl</kbd> +
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">K</kbd>{' '}
            — open the search palette
          </li>
          <li>
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Esc</kbd> —
            close the open dialog
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'about',
    label: 'About',
    icon: Sparkles,
    render: () => (
      <div className="space-y-4">
        <H>About this build</H>
        <P>
          Football Galaxy is a TypeScript + Vite + React + Tailwind app built around a
          design‑token surface. Page sections cascade in via Framer Motion, and asset
          images walk a multi‑source fallback chain so a broken crest never shows a
          broken image icon.
        </P>
      </div>
    ),
  },
]

export function HandbookDialog() {
  const fallback = sections[0]!
  const [activeId, setActiveId] = useState(fallback.id)
  const active = sections.find((section) => section.id === activeId) ?? fallback

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open handbook"
          title="Handbook"
        >
          <BookOpen className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="grid max-w-4xl gap-0 overflow-hidden p-0 sm:grid-cols-[200px_minmax(0,1fr)]">
        <DialogTitle className="sr-only">Football Galaxy Handbook</DialogTitle>
        <nav className="border-b border-border bg-muted/30 p-3 sm:border-b-0 sm:border-r">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Handbook
          </p>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-1">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = section.id === activeId
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(section.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-fg-md px-3 py-2 text-left text-sm transition',
                      isActive
                        ? 'bg-primary/12 text-foreground shadow-fg-1'
                        : 'text-muted-foreground hover:bg-background hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        <article className="max-h-[70vh] overflow-y-auto p-6">{active.render()}</article>
      </DialogContent>
    </Dialog>
  )
}
