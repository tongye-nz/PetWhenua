import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '../test/utils/test-utils'
import { usePetCard } from './usePetCard'
import type { Pet } from '../models/pet.types'

const mockPet: Pet = {
  petId: 1,
  name: 'Buddy',
  species: 'Dog',
  breed: 'Golden Retriever',
  age: 3,
  description: 'Friendly dog',
  userId: 1,
  profilePicture: '/images/buddy.jpg',
  birthYear: 2021,
  birthMonth: 6,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

describe('usePetCard', () => {
  describe('basic functionality', () => {
    it('should initialize with closed menu', () => {
      const { result } = renderHook(() => usePetCard({ pet: mockPet }))
      
      expect(result.current.anchorEl).toBeNull()
      expect(result.current.menuOpen).toBe(false)
    })

    it('should not have actions when no callbacks provided', () => {
      const { result } = renderHook(() => usePetCard({ pet: mockPet }))
      
      expect(result.current.hasActions).toBe(false)
    })

    it('should have actions when callbacks provided', () => {
      const onView = vi.fn()
      const onEdit = vi.fn()
      const onDelete = vi.fn()
      
      const { result } = renderHook(() => usePetCard({ 
        pet: mockPet, 
        onView, 
        onEdit, 
        onDelete 
      }))
      
      expect(result.current.hasActions).toBe(true)
    })
  })

  describe('menu interactions', () => {
    it('should open menu when handleMenuClick called', () => {
      const { result } = renderHook(() => usePetCard({ pet: mockPet }))
      
      // Mock a click event
      const mockEvent = {
        stopPropagation: vi.fn(),
        currentTarget: document.createElement('button')
      } as any
      
      act(() => {
        result.current.handleMenuClick(mockEvent)
      })
      
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
      expect(result.current.anchorEl).toBe(mockEvent.currentTarget)
      expect(result.current.menuOpen).toBe(true)
    })

    it('should close menu when handleMenuClose called', () => {
      const { result } = renderHook(() => usePetCard({ pet: mockPet }))
      
      // First open the menu
      const mockEvent = {
        stopPropagation: vi.fn(),
        currentTarget: document.createElement('button')
      } as any
      
      act(() => {
        result.current.handleMenuClick(mockEvent)
      })
      
      expect(result.current.menuOpen).toBe(true)
      
      // Then close it
      act(() => {
        result.current.handleMenuClose()
      })
      
      expect(result.current.anchorEl).toBeNull()
      expect(result.current.menuOpen).toBe(false)
    })
  })

  describe('card click interactions', () => {
    it('should call onView when card clicked and menu is closed', () => {
      const onView = vi.fn()
      const { result } = renderHook(() => usePetCard({ 
        pet: mockPet, 
        onView 
      }))
      
      act(() => {
        result.current.handleCardClick()
      })
      
      expect(onView).toHaveBeenCalledWith(mockPet)
    })

    it('should not call onView when card clicked and menu is open', () => {
      const onView = vi.fn()
      const { result } = renderHook(() => usePetCard({ 
        pet: mockPet, 
        onView 
      }))
      
      // Open menu first
      const mockEvent = {
        stopPropagation: vi.fn(),
        currentTarget: document.createElement('button')
      } as any
      
      act(() => {
        result.current.handleMenuClick(mockEvent)
      })
      
      // Try to click card while menu is open
      act(() => {
        result.current.handleCardClick()
      })
      
      expect(onView).not.toHaveBeenCalled()
    })

    it('should not call onView when not provided', () => {
      const { result } = renderHook(() => usePetCard({ pet: mockPet }))
      
      // This should not throw an error
      act(() => {
        result.current.handleCardClick()
      })
      
      // No assertions needed - just ensuring no error is thrown
    })
  })

  describe('different action combinations', () => {
    it('should have actions with only onEdit', () => {
      const onEdit = vi.fn()
      const { result } = renderHook(() => usePetCard({ 
        pet: mockPet, 
        onEdit 
      }))
      
      expect(result.current.hasActions).toBe(true)
    })

    it('should have actions with only onDelete', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => usePetCard({ 
        pet: mockPet, 
        onDelete 
      }))
      
      expect(result.current.hasActions).toBe(true)
    })

    it('should have actions with only onView', () => {
      const onView = vi.fn()
      const { result } = renderHook(() => usePetCard({ 
        pet: mockPet, 
        onView 
      }))
      
      expect(result.current.hasActions).toBe(true)
    })
  })
}) 