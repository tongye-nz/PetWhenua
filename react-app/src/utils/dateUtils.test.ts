import { describe, it, expect } from 'vitest'
import { formatTimeAgo, formatDate } from './dateUtils'

describe('dateUtils', () => {
  describe('formatTimeAgo', () => {
    it('should return "Just now" for recent times', () => {
      const now = new Date().toISOString()
      const result = formatTimeAgo(now)
      expect(result).toBe('Just now')
    })

    it('should format minutes ago correctly', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const result = formatTimeAgo(fiveMinutesAgo)
      expect(result).toContain('minute')
      expect(result).toContain('ago')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const testDate = '2024-01-15T10:30:00Z'
      const result = formatDate(testDate)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toContain('2024')
    })
  })
}) 