#!/usr/bin/env node
/**
 * Cross-checks the league tables of the app's two sources: ESPN (primary) and
 * football-data.org (fallback). Both are read through the local dev proxy, so
 * run `npm run proxy:dev` first (it holds the football-data.org key).
 *
 *   node scripts/verify-live-data.mjs [--proxy http://localhost:8787/api/live] [--markdown]
 *
 * Per league it checks the table arithmetic of each source, then pairs the
 * clubs and reports every difference in played games, points and goal
 * difference. Exit code 1 when anything differs.
 */

const args = process.argv.slice(2)
const proxyArg = args.indexOf('--proxy')
const PROXY = proxyArg >= 0 ? args[proxyArg + 1] : 'http://localhost:8787/api/live'
const MARKDOWN = args.includes('--markdown')

const LEAGUES = [
  { id: 'premier-league', name: 'Premier League', espn: 'eng.1', fd: 'PL', teams: 20 },
  { id: 'la-liga', name: 'La Liga', espn: 'esp.1', fd: 'PD', teams: 20 },
  { id: 'bundesliga', name: 'Bundesliga', espn: 'ger.1', fd: 'BL1', teams: 18 },
  { id: 'serie-a', name: 'Serie A', espn: 'ita.1', fd: 'SA', teams: 20 },
  { id: 'ligue-1', name: 'Ligue 1', espn: 'fra.1', fd: 'FL1', teams: 18 },
]

/** The app's season rule: a new season starts on 1 July. */
function seasonStartYear(now = new Date()) {
  return now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
}

async function viaProxy(target) {
  const response = await fetch(`${PROXY}?target=${encodeURIComponent(target)}`)
  if (!response.ok) throw new Error(`${response.status} for ${target}`)
  return response.json()
}

function espnRows(payload) {
  const entries = payload?.children?.[0]?.standings?.entries ?? []
  return entries.map((entry) => {
    const stat = (name) => entry.stats?.find((item) => item.name === name)?.value ?? 0
    return {
      names: [entry.team?.displayName, entry.team?.shortDisplayName, entry.team?.name].filter(Boolean),
      label: entry.team?.displayName ?? '?',
      position: stat('rank'),
      played: stat('gamesPlayed'),
      won: stat('wins'),
      drawn: stat('ties'),
      lost: stat('losses'),
      goalsFor: stat('pointsFor'),
      goalsAgainst: stat('pointsAgainst'),
      goalDifference: stat('pointDifferential'),
      points: stat('points'),
    }
  })
}

function fdRows(payload) {
  const table = (payload?.standings ?? []).find((block) => block.type === 'TOTAL')?.table ?? []
  return table.map((row) => ({
    names: [row.team?.name, row.team?.shortName].filter(Boolean),
    label: row.team?.shortName ?? row.team?.name ?? '?',
    position: row.position,
    played: row.playedGames,
    won: row.won,
    drawn: row.draw,
    lost: row.lost,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    points: row.points,
  }))
}

const STOP = new Set(['fc', 'cf', 'ac', 'as', 'sc', 'ss', 'us', 'rc', 'cd', 'ud', 'sd', 'afc', 'ssc', 'vfb', 'vfl', 'tsg', 'rcd', 'ca', 'de', 'la', 'le', 'and', 'club', '1', '1899', '04', '05', '1846', '1907', '1909', '1913'])

/** Name tokens without accents, legal-form noise or common words. */
function tokens(name) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/munchen/g, 'munich')
    .replace(/koln/g, 'cologne')
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !STOP.has(token))
}

function similarity(a, b) {
  const left = new Set(a.names.flatMap(tokens))
  const right = new Set(b.names.flatMap(tokens))
  const shared = [...left].filter((token) => right.has(token) || [...right].some((other) => other.startsWith(token) || token.startsWith(other))).length
  return shared / Math.max(1, Math.min(left.size, right.size))
}

/** Greedy pairing by name similarity; leftovers are reported, not guessed. */
function pair(espn, fd) {
  const candidates = espn
    .flatMap((left) => fd.map((right) => ({ left, right, score: similarity(left, right) })))
    .filter((candidate) => candidate.score >= 0.5)
    .sort((a, b) => b.score - a.score)
  const usedLeft = new Set()
  const usedRight = new Set()
  const pairs = []
  for (const candidate of candidates) {
    if (usedLeft.has(candidate.left) || usedRight.has(candidate.right)) continue
    usedLeft.add(candidate.left)
    usedRight.add(candidate.right)
    pairs.push(candidate)
  }
  return {
    pairs,
    unmatchedEspn: espn.filter((row) => !usedLeft.has(row)),
    unmatchedFd: fd.filter((row) => !usedRight.has(row)),
  }
}

function arithmetic(rows, expectedTeams) {
  const issues = []
  if (rows.length !== expectedTeams) issues.push(`${rows.length} teams, expected ${expectedTeams}`)
  for (const row of rows) {
    if (row.points !== row.won * 3 + row.drawn) issues.push(`${row.label}: points ${row.points} ≠ 3×${row.won}+${row.drawn}`)
    if (row.played !== row.won + row.drawn + row.lost) issues.push(`${row.label}: played ${row.played} ≠ W+D+L`)
    if (row.goalDifference !== row.goalsFor - row.goalsAgainst) issues.push(`${row.label}: goal difference ≠ GF−GA`)
  }
  const sum = (key) => rows.reduce((total, row) => total + row[key], 0)
  if (sum('won') !== sum('lost')) issues.push(`wins ${sum('won')} ≠ losses ${sum('lost')}`)
  if (sum('goalsFor') !== sum('goalsAgainst')) issues.push(`goals for ${sum('goalsFor')} ≠ against ${sum('goalsAgainst')}`)
  return issues
}

async function checkLeague(league, season) {
  const [espnPayload, fdPayload] = await Promise.all([
    viaProxy(`https://site.web.api.espn.com/apis/v2/sports/soccer/${league.espn}/standings`),
    viaProxy(`https://api.football-data.org/v4/competitions/${league.fd}/standings?season=${season}`),
  ])
  const espn = espnRows(espnPayload)
  const fd = fdRows(fdPayload)
  const { pairs, unmatchedEspn, unmatchedFd } = pair(espn, fd)
  const differences = []
  for (const { left, right } of pairs) {
    for (const key of ['played', 'points', 'goalDifference', 'goalsFor', 'position']) {
      if (left[key] !== right[key]) differences.push({ team: left.label, key, espn: left[key], fd: right[key] })
    }
  }
  return {
    league,
    espnIssues: arithmetic(espn, league.teams),
    fdIssues: arithmetic(fd, league.teams),
    paired: pairs.length,
    unmatchedEspn: unmatchedEspn.map((row) => row.label),
    unmatchedFd: unmatchedFd.map((row) => row.label),
    differences,
  }
}

function printText(results) {
  for (const result of results) {
    console.log(`\n== ${result.league.name} ==`)
    if (result.error) {
      console.log(`  error: ${result.error}`)
      continue
    }
    console.log(`  paired ${result.paired}/${result.league.teams} clubs`)
    for (const issue of result.espnIssues) console.log(`  ESPN: ${issue}`)
    for (const issue of result.fdIssues) console.log(`  football-data: ${issue}`)
    if (result.unmatchedEspn.length) console.log(`  unmatched ESPN: ${result.unmatchedEspn.join(', ')}`)
    if (result.unmatchedFd.length) console.log(`  unmatched football-data: ${result.unmatchedFd.join(', ')}`)
    for (const diff of result.differences) console.log(`  ${diff.team}: ${diff.key} ESPN ${diff.espn} vs football-data ${diff.fd}`)
    if (!result.espnIssues.length && !result.fdIssues.length && !result.differences.length && !result.unmatchedEspn.length) console.log('  ✓ identical')
  }
}

function printMarkdown(results, season) {
  console.log(`| League | Paired | ESPN arithmetic | football-data arithmetic | Differences |`)
  console.log(`|---|---|---|---|---|`)
  for (const result of results) {
    if (result.error) {
      console.log(`| ${result.league.name} | – | – | – | error: ${result.error} |`)
      continue
    }
    const diffs = result.differences.map((diff) => `${diff.team} ${diff.key}: ${diff.espn} vs ${diff.fd}`).join('<br>') || 'none'
    console.log(
      `| ${result.league.name} | ${result.paired}/${result.league.teams} | ${result.espnIssues.join('<br>') || 'ok'} | ${result.fdIssues.join('<br>') || 'ok'} | ${diffs} |`,
    )
  }
  console.log(`\nSeason ${season}/${String(season + 1).slice(2)}, checked ${new Date().toISOString()}.`)
}

const season = seasonStartYear()
const results = []
for (const league of LEAGUES) {
  try {
    results.push(await checkLeague(league, season))
  } catch (error) {
    results.push({ league, error: error instanceof Error ? error.message : String(error) })
  }
}

if (MARKDOWN) printMarkdown(results, season)
else printText(results)

const failed = results.some(
  (result) => result.error || result.espnIssues.length || result.fdIssues.length || result.differences.length || result.unmatchedEspn.length,
)
process.exitCode = failed ? 1 : 0
