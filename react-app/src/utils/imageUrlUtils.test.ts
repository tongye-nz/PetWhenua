import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getFullImageUrl, getProfilePictureUrl, getPostImageUrl } from './imageUrlUtils'

// Mock the API_CONFIG
vi.mock('../api/config', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:5000/api'
  }
}))

describe('imageUrlUtils', () => {
  describe('getFullImageUrl', () => {
    it('should return undefined for null/undefined input', () => {
      expect(getFullImageUrl(null)).toBeUndefined()
      expect(getFullImageUrl(undefined)).toBeUndefined()
      expect(getFullImageUrl('')).toBeUndefined()
    })

    it('should return full URLs unchanged', () => {
      const httpUrl = 'http://example.com/image.jpg'
      const httpsUrl = 'https://example.com/image.jpg'
      
      expect(getFullImageUrl(httpUrl)).toBe(httpUrl)
      expect(getFullImageUrl(httpsUrl)).toBe(httpsUrl)
    })

    it('should return data URLs unchanged', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...'
      expect(getFullImageUrl(dataUrl)).toBe(dataUrl)
    })

    it('should construct full URL for relative paths starting with /', () => {
      const relativePath = '/uploads/image.jpg'
      const expected = 'http://localhost:5000/uploads/image.jpg'
      expect(getFullImageUrl(relativePath)).toBe(expected)
    })

    it('should construct full URL for paths not starting with /', () => {
      const path = 'uploads/image.jpg'
      const expected = 'http://localhost:5000/uploads/image.jpg'
      expect(getFullImageUrl(path)).toBe(expected)
    })

    it('should handle various file extensions', () => {
      expect(getFullImageUrl('/image.png')).toBe('http://localhost:5000/image.png')
      expect(getFullImageUrl('/image.gif')).toBe('http://localhost:5000/image.gif')
      expect(getFullImageUrl('/image.webp')).toBe('http://localhost:5000/image.webp')
    })
  })

  describe('getProfilePictureUrl', () => {
    it('should delegate to getFullImageUrl', () => {
      const profileUrl = '/uploads/profile.jpg'
      const result = getProfilePictureUrl(profileUrl)
      expect(result).toBe('http://localhost:5000/uploads/profile.jpg')
    })

    it('should handle null/undefined inputs', () => {
      expect(getProfilePictureUrl(null)).toBeUndefined()
      expect(getProfilePictureUrl(undefined)).toBeUndefined()
    })

    it('should handle full URLs', () => {
      const fullUrl = 'https://example.com/profile.jpg'
      expect(getProfilePictureUrl(fullUrl)).toBe(fullUrl)
    })
  })

  describe('getPostImageUrl', () => {
    it('should delegate to getFullImageUrl', () => {
      const postImageUrl = '/uploads/post-image.jpg'
      const result = getPostImageUrl(postImageUrl)
      expect(result).toBe('http://localhost:5000/uploads/post-image.jpg')
    })

    it('should handle null/undefined inputs', () => {
      expect(getPostImageUrl(null)).toBeUndefined()
      expect(getPostImageUrl(undefined)).toBeUndefined()
    })

    it('should handle data URLs', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
      expect(getPostImageUrl(dataUrl)).toBe(dataUrl)
    })
  })
}) 