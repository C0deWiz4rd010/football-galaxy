// Fetch live standings for all 5 leagues via local proxy and save to JSON.
import { writeFileSync } from 'node:fs'

const codes = ['PL', 'BL1', 'PD', 'SA', 'FL1']
const out = {}

for (const code of codes) {
  const target = encodeURIComponent(`https://api.football-data.org/v4/competitions/${code}/standings`)
  const url = `http://localhost:8787/api/live?target=${target}`
  process.stdout.write(`Fetching ${code}... `)
  const r = await fetch(url)
  if (!r.ok) {
    console.log(`HTTP ${r.status}`)
    out[code] = { error: r.status, body: await r.text() }
    continue
  }
  const j = await r.json()
  out[code] = {
    season: j.season,
    table: j.standings[0].table.map((row) => ({
      position: row.position,
      name: row.team.name,
      shortName: row.team.shortName,
      tla: row.team.tla,
      crest: row.team.crest,
      points: row.points,
      played: row.playedGames,
      won: row.won,
      drawn: row.draw,
      lost: row.lost,
      gf: row.goalsFor,
      ga: row.goalsAgainst,
    })),
  }
  console.log(`OK (${out[code].table.length} teams)`)
  await new Promise((r) => setTimeout(r, 7000)) // respect rate-limit (10/min)
}

writeFileSync(new URL('../standings-snapshot.json', import.meta.url), JSON.stringify(out, null, 2))
console.log('Saved standings-snapshot.json')
