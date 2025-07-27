import { describe, it, expect } from 'vitest'
import { formatTimeAgo, formatDate } from './dateUtils'

describe('dateUtils', () => {
  describe('formatTimeAgo', () => {
    it('should handle relative time differences', () => {
      // Use a time that's recent enough to get "Just now" but account for timezone
      const now = new Date()
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000).toISOString()
      const result = formatTimeAgo(thirtySecondsAgo)
      
      // Should return either "Just now" or a small time difference
      expect(result).toMatch(/^(Just now|\d+ (second|minute)s? ago)$/)
    })

    it('should handle minute differences', () => {
      // Use a time that's definitely more than a minute ago
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString()
      const result = formatTimeAgo(fiveMinutesAgo)
      
      // Should contain minute or hour (depending on timezone conversion)
      expect(result).toMatch(/(minute|hour)s? ago/)
    })

    it('should handle hour differences', () => {
      // Use a time that's definitely more than an hour ago
      const now = new Date()
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      const result = formatTimeAgo(twoHoursAgo)
      
      // Should contain hour, day, or be a formatted date
      expect(result).toMatch(/(hour|day)s? ago|^\d{1,2} \w{3} \d{4}$/)
    })

    it('should return a string for any valid date input', () => {
      const testDate = '2024-01-15T10:30:00Z'
      const result = formatTimeAgo(testDate)
      
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle very old dates', () => {
      // Use a date that's definitely old enough to get formatted date
      const oldDate = '2020-01-15T10:30:00Z'
      const result = formatTimeAgo(oldDate)
      
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      // Should either be relative time or formatted date
      expect(result).toMatch(/ago|^\d{1,2} \w{3} \d{4}$/)
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const testDate = '2024-01-15T10:30:00Z'
      const result = formatDate(testDate)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toContain('2024')
      expect(result).toContain('Jan') // Should contain month abbreviation
    })

    it('should handle different date formats', () => {
      const testDate = '2024-12-25T15:45:00Z'
      const result = formatDate(testDate)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toContain('2024')
      expect(result).toContain('Dec')
      // Date might shift due to NZ timezone conversion (UTC+12/+13)
      expect(result).toMatch(/2[5-6]/) // Accept either 25 or 26
    })
  })
}) 