import { describe, it, expect } from 'vitest'
import { combineLocation, parseLocation } from './locationUtils'

describe('locationUtils', () => {
  describe('combineLocation', () => {
    it('should combine region and district correctly', () => {
      expect(combineLocation('Auckland', 'Auckland Central')).toBe('Auckland Central, Auckland')
      expect(combineLocation('Canterbury', 'Christchurch')).toBe('Christchurch, Canterbury')
      expect(combineLocation('Wellington', 'Wellington City')).toBe('Wellington City, Wellington')
    })

    it('should handle region only', () => {
      expect(combineLocation('Auckland', '')).toBe('Auckland')
      expect(combineLocation('Canterbury', '')).toBe('Canterbury')
    })

    it('should handle district only', () => {
      expect(combineLocation('', 'Auckland Central')).toBe('Auckland Central')
      expect(combineLocation('', 'Christchurch')).toBe('Christchurch')
    })

    it('should handle empty inputs', () => {
      expect(combineLocation('', '')).toBe('')
    })

    it('should handle whitespace correctly', () => {
      expect(combineLocation('  Auckland  ', '  Auckland Central  ')).toBe('  Auckland Central  ,   Auckland  ')
    })

    it('should handle special characters', () => {
      expect(combineLocation('Bay of Plenty', 'Tauranga-Mount Maunganui')).toBe('Tauranga-Mount Maunganui, Bay of Plenty')
    })
  })

  describe('parseLocation', () => {
    it('should parse combined location correctly', () => {
      expect(parseLocation('Auckland Central, Auckland')).toEqual({
        region: 'Auckland',
        district: 'Auckland Central'
      })
      
      expect(parseLocation('Christchurch, Canterbury')).toEqual({
        region: 'Canterbury',
        district: 'Christchurch'
      })
    })

    it('should handle single location as region', () => {
      expect(parseLocation('Auckland')).toEqual({
        region: 'Auckland',
        district: ''
      })
      
      expect(parseLocation('Canterbury')).toEqual({
        region: 'Canterbury',
        district: ''
      })
    })

    it('should handle empty input', () => {
      expect(parseLocation('')).toEqual({
        region: '',
        district: ''
      })
    })

    it('should handle multiple commas by taking first two parts', () => {
      expect(parseLocation('Auckland Central, Auckland, New Zealand')).toEqual({
        region: 'Auckland',
        district: 'Auckland Central'
      })
    })

    it('should trim whitespace correctly', () => {
      expect(parseLocation('  Auckland Central  ,   Auckland  ')).toEqual({
        region: 'Auckland',
        district: 'Auckland Central'
      })
    })

    it('should handle locations with hyphens and apostrophes', () => {
      expect(parseLocation("Tauranga-Mount Maunganui, Bay of Plenty")).toEqual({
        region: 'Bay of Plenty',
        district: 'Tauranga-Mount Maunganui'
      })
    })

    it('should be reversible with combineLocation', () => {
      const original = { region: 'Auckland', district: 'Auckland Central' }
      const combined = combineLocation(original.region, original.district)
      const parsed = parseLocation(combined)
      
      expect(parsed).toEqual(original)
    })
  })
}) 