import { describe, it, expect } from 'vitest'
import { 
  getCategoriesForPostType, 
  shouldUsePredefinedCategories, 
  isValidCategoryForPostType 
} from './categoryUtils'
import { BUY_SELL_CATEGORIES } from '../data/categories'

describe('categoryUtils', () => {
  describe('getCategoriesForPostType', () => {
    it('should return BUY_SELL_CATEGORIES for BuySell post type (number 2)', () => {
      const categories = getCategoriesForPostType(2)
      expect(categories).toEqual(BUY_SELL_CATEGORIES)
      expect(categories).toBeInstanceOf(Array)
      expect(categories.length).toBeGreaterThan(0)
    })

    it('should return BUY_SELL_CATEGORIES for BuySell post type (string)', () => {
      const categories = getCategoriesForPostType('BuySell')
      expect(categories).toEqual(BUY_SELL_CATEGORIES)
    })

    it('should return empty array for unknown post type', () => {
      expect(getCategoriesForPostType(1)).toEqual([])
      expect(getCategoriesForPostType(3)).toEqual([])
      expect(getCategoriesForPostType('Unknown')).toEqual([])
    })

    it('should return empty array for invalid input', () => {
      expect(getCategoriesForPostType('')).toEqual([])
      expect(getCategoriesForPostType(0)).toEqual([])
      expect(getCategoriesForPostType(-1)).toEqual([])
    })
  })

  describe('shouldUsePredefinedCategories', () => {
    it('should return true for BuySell post type (number)', () => {
      expect(shouldUsePredefinedCategories(2)).toBe(true)
    })

    it('should return true for BuySell post type (string)', () => {
      expect(shouldUsePredefinedCategories('BuySell')).toBe(true)
    })

    it('should return false for other post types', () => {
      expect(shouldUsePredefinedCategories(1)).toBe(false)
      expect(shouldUsePredefinedCategories(3)).toBe(false)
      expect(shouldUsePredefinedCategories('General')).toBe(false)
      expect(shouldUsePredefinedCategories('Unknown')).toBe(false)
    })

    it('should return false for invalid input', () => {
      expect(shouldUsePredefinedCategories('')).toBe(false)
      expect(shouldUsePredefinedCategories(0)).toBe(false)
      expect(shouldUsePredefinedCategories(-1)).toBe(false)
    })
  })

  describe('isValidCategoryForPostType', () => {
    it('should validate categories for BuySell posts', () => {
      const firstCategory = BUY_SELL_CATEGORIES[0]
      expect(isValidCategoryForPostType(firstCategory, 2)).toBe(true)
      expect(isValidCategoryForPostType(firstCategory, 'BuySell')).toBe(true)
    })

    it('should reject invalid categories for BuySell posts', () => {
      expect(isValidCategoryForPostType('Invalid Category', 2)).toBe(false)
      expect(isValidCategoryForPostType('NonExistent', 'BuySell')).toBe(false)
    })

    it('should return false for categories on non-BuySell posts', () => {
      const category = BUY_SELL_CATEGORIES[0]
      expect(isValidCategoryForPostType(category, 1)).toBe(false)
      expect(isValidCategoryForPostType(category, 'General')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidCategoryForPostType('', 2)).toBe(false)
      expect(isValidCategoryForPostType('Category', 0)).toBe(false)
      expect(isValidCategoryForPostType('', '')).toBe(false)
    })
  })
}) 