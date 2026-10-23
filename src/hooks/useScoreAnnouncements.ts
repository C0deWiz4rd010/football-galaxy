import { useEffect, useRef, useState } from 'react'

import type { LiveMatch } from '@/services/espn/liveScores'

const scoreOf = (match: LiveMatch) => `${match.home.score ?? '-'}:${match.away.score ?? '-'}`

/**
 * Text for a polite live region: only score changes since the last poll are
 * announced, never the whole list on every refresh.
 */
export function useScoreAnnouncements(matches: LiveMatch[], describe: (match: LiveMatch) => string): string {
  const previous = useRef<Map<string, string> | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const current = new Map(matches.map((match) => [match.id, scoreOf(match)]))
    const before = previous.current
    previous.current = current
    // First data is the baseline, not news.
    if (!before) return
    const changed = matches.filter((match) => match.state === 'live' && before.has(match.id) && before.get(match.id) !== current.get(match.id))
    if (changed.length) setMessage(changed.map(describe).join('. '))
  }, [matches, describe])

  return message
}
