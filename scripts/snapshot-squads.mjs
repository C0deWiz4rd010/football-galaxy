// Fetch real squads (player names, positions, DOB, nationality, shirt number)
// for every team in the 5 leagues, via the local proxy.
// Writes squads-snapshot.json. Uses 1 request per league (5 total) → safely
// inside the football-data.org free tier (10 req/min).
import { writeFileSync } from 'node:fs'

const codes = ['PL', 'BL1', 'PD', 'SA', 'FL1']
const out = {}

for (const code of codes) {
  const target = encodeURIComponent(`https://api.football-data.org/v4/competitions/${code}/teams`)
  const url = `http://localhost:8787/api/live?target=${target}`
  process.stdout.write(`Fetching ${code} squads... `)
  const r = await fetch(url)
  if (!r.ok) {
    console.log(`HTTP ${r.status}`)
    out[code] = { error: r.status, body: await r.text() }
    continue
  }
  const j = await r.json()
  out[code] = {
    teams: (j.teams ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      shortName: t.shortName ?? null,
      tla: t.tla ?? null,
      crest: t.crest ?? null,
      venue: t.venue ?? null,
      founded: t.founded ?? null,
      coach: t.coach
        ? {
            name: t.coach.name ?? null,
            nationality: t.coach.nationality ?? null,
            dateOfBirth: t.coach.dateOfBirth ?? null,
          }
        : null,
      squad: (t.squad ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position ?? null,
        dateOfBirth: p.dateOfBirth ?? null,
        nationality: p.nationality ?? null,
        shirtNumber: p.shirtNumber ?? null,
      })),
    })),
  }
  const totalPlayers = out[code].teams.reduce((sum, t) => sum + t.squad.length, 0)
  console.log(`OK (${out[code].teams.length} teams, ${totalPlayers} players)`)
  await new Promise((r) => setTimeout(r, 7000)) // respect rate-limit (10/min)
}

writeFileSync(new URL('../squads-snapshot.json', import.meta.url), JSON.stringify(out, null, 2))
console.log('Saved squads-snapshot.json')
