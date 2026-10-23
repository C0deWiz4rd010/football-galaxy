import { describe, expect, it } from 'vitest'

import { countryName, nationName } from './countries'
import { positionBucket } from './positions'

describe('nationName', () => {
  it('translates FIFA codes, including the home nations Intl does not know', () => {
    expect(nationName('GER', 'Germany', 'de')).toBe('Deutschland')
    expect(nationName('GER', 'Germany', 'en')).toBe('Germany')
    expect(nationName('ENG', 'England', 'de')).toBe('England')
    expect(nationName('SCO', 'Scotland', 'de')).toBe('Schottland')
  })

  it('falls back to the provider name for unknown codes', () => {
    expect(nationName('XYZ', 'Atlantis', 'de')).toBe('Atlantis')
  })
})

describe('countryName', () => {
  it('translates English country names', () => {
    expect(countryName('Mexico', 'de')).toBe('Mexiko')
    expect(countryName('United States', 'en')).toBe('United States')
    expect(countryName(undefined, 'de')).toBe('')
  })
})

describe('positionBucket', () => {
  it('sorts provider position text into the four lines', () => {
    expect(positionBucket('Goalkeeper')).toBe('GK')
    expect(positionBucket('G')).toBe('GK')
    expect(positionBucket('Centre-Back')).toBe('DF')
    expect(positionBucket('Defensive Midfield')).toBe('MF')
    expect(positionBucket('Left Winger')).toBe('FW')
    expect(positionBucket('Offence')).toBe('FW')
    expect(positionBucket('')).toBeUndefined()
    expect(positionBucket('Coach')).toBeUndefined()
  })
})
