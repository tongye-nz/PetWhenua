import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatTimeAgo, formatDate } from './dateUtils'

describe('dateUtils', () => {
  beforeEach(() => {
    // Set a fixed system time for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z')) // UTC time
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatTimeAgo', () => {
    it('should return "Just now" for recent times', () => {
      // Create a time that's just 30 seconds ago
      const recentTime = new Date(Date.now() - 30 * 1000).toISOString()
      const result = formatTimeAgo(recentTime)
      expect(result).toBe('Just now')
    })

    it('should format minutes ago correctly', () => {
      // Create a time that's 5 minutes ago
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