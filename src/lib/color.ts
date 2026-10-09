/**
 * Contrast helpers for data-driven colours (club and league colours from the
 * APIs), which can be anything from white to near-black.
 */

const LIGHT_TEXT = '#ffffff'
const DARK_TEXT = '#0b1220'

function parseHex(color: string): [number, number, number] | null {
  const hex = color.trim().replace(/^#/, '')
  const full = hex.length === 3 ? hex.replace(/./g, (char) => char + char) : hex
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16)) as [number, number, number]
}

/** WCAG relative luminance (0 = black, 1 = white); `null` for non-hex input. */
export function relativeLuminance(color: string): number | null {
  const rgb = parseHex(color)
  if (!rgb) return null
  const [r, g, b] = rgb.map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a) ?? 0
  const lb = relativeLuminance(b) ?? 0
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Black or white text, whichever reads better on `background`. */
export function readableTextOn(background: string | undefined): string {
  if (!background || relativeLuminance(background) === null) return LIGHT_TEXT
  return contrastRatio(background, LIGHT_TEXT) >= contrastRatio(background, DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT
}
