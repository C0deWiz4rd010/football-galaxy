import { describe, expect, it } from 'vitest'

import { contrastRatio, readableTextOn, relativeLuminance } from './color'

describe('color contrast helpers', () => {
  it('computes WCAG luminance and contrast', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1)
    expect(relativeLuminance('#000')).toBe(0)
    expect(relativeLuminance('not-a-colour')).toBeNull()
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21)
  })

  it('picks dark text on light club colours and white text on dark ones', () => {
    expect(readableTextOn('#ffffff')).toBe('#0b1220')
    expect(readableTextOn('#6cabdd')).toBe('#0b1220')
    expect(readableTextOn('#3d195b')).toBe('#ffffff')
    expect(readableTextOn(undefined)).toBe('#ffffff')
  })
})
