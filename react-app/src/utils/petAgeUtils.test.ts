import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculatePetAge, formatPetAge, calculateAgeInYears } from './petAgeUtils'

describe('petAgeUtils', () => {
  beforeEach(() => {
    // Mock current date to January 15, 2024 for consistent testing
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('calculatePetAge', () => {
    it('should calculate correct age for pet born this year', () => {
      const result = calculatePetAge(2024, 1) // Born January 2024
      expect(result).toEqual({ years: 0, months: 0, totalMonths: 0 })
    })

    it('should calculate correct age for pet born last year', () => {
      const result = calculatePetAge(2023, 1) // Born January 2023
      expect(result).toEqual({ years: 1, months: 0, totalMonths: 12 })
    })

    it('should calculate correct age when current month is after birth month', () => {
      const result = calculatePetAge(2023, 11) // Born November 2023
      expect(result).toEqual({ years: 0, months: 2, totalMonths: 2 })
    })

    it('should calculate correct age when current month is before birth month', () => {
      const result = calculatePetAge(2023, 3) // Born March 2023
      expect(result).toEqual({ years: 0, months: 10, totalMonths: 10 })
    })

    it('should default to January when no birth month provided', () => {
      const result = calculatePetAge(2023) // No month provided
      expect(result).toEqual({ years: 1, months: 0, totalMonths: 12 })
    })

    it('should handle pets born multiple years ago', () => {
      const result = calculatePetAge(2020, 6) // Born June 2020
      expect(result).toEqual({ years: 3, months: 7, totalMonths: 43 })
    })

    it('should handle edge case of December birth with January current', () => {
      const result = calculatePetAge(2022, 12) // Born December 2022
      expect(result).toEqual({ years: 1, months: 1, totalMonths: 13 })
    })
  })

  describe('formatPetAge', () => {
    it('should format age for very young pets (months only)', () => {
      expect(formatPetAge(2024, 1)).toBe('0 months old') // 0 months
      expect(formatPetAge(2023, 12)).toBe('1 month old') // 1 month
      expect(formatPetAge(2023, 11)).toBe('2 months old') // 2 months
    })

    it('should format age for pets exactly 1 year old', () => {
      expect(formatPetAge(2023, 1)).toBe('1 year old')
    })

    it('should format age for pets exactly multiple years old', () => {
      expect(formatPetAge(2022, 1)).toBe('2 years old')
      expect(formatPetAge(2021, 1)).toBe('3 years old')
    })

    it('should format age for pets with years and months', () => {
      expect(formatPetAge(2022, 11)).toBe('1 year 2 months old')
      expect(formatPetAge(2021, 6)).toBe('2 years 7 months old')
    })

    it('should handle singular vs plural correctly', () => {
      expect(formatPetAge(2022, 12)).toBe('1 year 1 month old') // Singular
      expect(formatPetAge(2020, 12)).toBe('3 years 1 month old') // Mixed
    })

    it('should use January as default month', () => {
      expect(formatPetAge(2023)).toBe('1 year old') // No month provided
      expect(formatPetAge(2022)).toBe('2 years old') // No month provided
    })
  })

  describe('calculateAgeInYears', () => {
    it('should calculate simple age in years', () => {
      expect(calculateAgeInYears(2023)).toBe(1)
      expect(calculateAgeInYears(2022)).toBe(2)
      expect(calculateAgeInYears(2021)).toBe(3)
    })

    it('should handle current year birth', () => {
      expect(calculateAgeInYears(2024)).toBe(0)
    })

    it('should handle much older pets', () => {
      expect(calculateAgeInYears(2010)).toBe(14)
      expect(calculateAgeInYears(2005)).toBe(19)
    })

    it('should return positive numbers for past years', () => {
      const result = calculateAgeInYears(2020)
      expect(result).toBe(4)
      expect(result).toBeGreaterThanOrEqual(0)
    })
  })
}) 