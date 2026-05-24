import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const proxyBase = process.env.VITE_LIVE_DATA_PROXY_URL?.replace(/\/$/, '') ?? 'http://localhost:8787/api/live'

const teams = [
  { league: 'Premier League', slug: 'eng.1', team: 'Liverpool', id: '364' },
  { league: 'Bundesliga', slug: 'ger.1', team: 'Bayern Munich', id: '132' },
  { league: 'La Liga', slug: 'esp.1', team: 'Real Madrid', id: '86' },
  { league: 'Serie A', slug: 'ita.1', team: 'Internazionale', id: '110' },
  { league: 'Ligue 1', slug: 'fra.1', team: 'Paris Saint-Germain', id: '160' },
]

function proxyUrl(target) {
  return `${proxyBase}?target=${encodeURIComponent(target)}`
}

function statByName(athlete, name) {
  const categories = athlete.statistics?.splits?.categories ?? []
  for (const category of categories) {
    const stat = category.stats?.find((item) => item.name === name)
    if (stat) {
      const value = Number(stat.value ?? 0)
      return Number.isFinite(value) ? value : 0
    }
  }
  return 0
}

function safeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|')
}

async function fetchRoster({ slug, id }) {
  const target = `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/teams/${id}/roster`
  const response = await fetch(proxyUrl(target))
  if (!response.ok) {
    throw new Error(`Roster request failed for ${slug}/${id}: ${response.status}`)
  }
  return response.json()
}

const generatedAt = new Date().toISOString()
const lines = [
  '# Live Player Stats Comparison',
  '',
  `Generated: ${generatedAt}`,
  '',
  'Purpose: compare one representative team per top-five league against current ESPN roster statistics. Football Galaxy now maps these same ESPN roster values into live player profiles and squad tables, with TheSportsDB used only as an extra photo-source fallback.',
  '',
  'Mapped app fields: appearances, goals, assists, yellow cards, red cards, derived minutes, and trend inputs from shots, shots on target, and saves.',
  '',
]

for (const team of teams) {
  const payload = await fetchRoster(team)
  const athletes = payload.athletes ?? []
  lines.push(`## ${team.team} - ${team.league}`)
  lines.push('')
  lines.push(`Source season: ${payload.season?.displayName ?? 'unknown'}`)
  lines.push(`Players returned: ${athletes.length}`)
  lines.push('')
  lines.push('| # | Player | Pos | Apps | G | A | YC | RC | Shots | SOT | Saves |')
  lines.push('|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|')

  athletes.forEach((athlete, index) => {
    lines.push([
      index + 1,
      safeCell(athlete.displayName ?? athlete.fullName ?? athlete.id),
      safeCell(athlete.position?.displayName ?? athlete.position?.name ?? ''),
      statByName(athlete, 'appearances'),
      statByName(athlete, 'totalGoals'),
      statByName(athlete, 'goalAssists'),
      statByName(athlete, 'yellowCards'),
      statByName(athlete, 'redCards'),
      statByName(athlete, 'totalShots'),
      statByName(athlete, 'shotsOnTarget'),
      statByName(athlete, 'saves'),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'))
  })

  lines.push('')
}

lines.push('## QA Notes')
lines.push('')
lines.push('- These rows are source-of-truth values from ESPN through the local live proxy.')
lines.push('- The app maps the same stat names in `src/services/theSportsDb.ts` via `mapEspnPlayer`.')
lines.push('- Player photos remain source-dependent: ESPN roster stats do not consistently expose headshots, so the app tries ESPN headshot fields when present, then TheSportsDB cutout/thumb/render images, then a generated fallback avatar.')
lines.push('- If the proxy is stopped, the app falls back to local mock data and these live values will not appear.')
lines.push('')

const outDir = resolve('docs', 'qa')
mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, 'player-stats-live-comparison-2026-05-17.md'), `${lines.join('\n')}\n`)
console.log('Wrote docs/qa/player-stats-live-comparison-2026-05-17.md')
