/** Derive XP progress toward next level threshold */
export function xpLevelThresholds(): number[] {
  return [0, 500, 1500, 3500, 7500, 15000]
}

export function playerLevel(totalXp: number): { level: number; current: number; next: number; pct: number } {
  const thresholds = xpLevelThresholds()
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalXp >= (thresholds[i] ?? 0)) {
      const current = thresholds[i] ?? 0
      const next = thresholds[i + 1] ?? current
      const range = next - current
      const pct = range > 0 ? Math.min(100, Math.round(((totalXp - current) / range) * 100)) : 100
      return { level: i + 1, current, next, pct }
    }
  }
  return { level: 1, current: 0, next: 500, pct: 0 }
}
