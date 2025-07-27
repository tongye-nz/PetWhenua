import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '../test/utils/test-utils'
import { useLocationSelector } from './useLocationSelector'

// Mock the dynamic import of nzLocations
const mockRegions = [
  { Name: 'Auckland', Code: 'AKL' },
  { Name: 'Canterbury', Code: 'CAN' },
  { Name: 'Wellington', Code: 'WEL' }
]

const mockDistricts = {
  'Auckland': [
    { Name: 'Auckland Central', Code: 'AC' },
    { Name: 'North Shore', Code: 'NS' }
  ],
  'Canterbury': [
    { Name: 'Christchurch', Code: 'CHC' },
    { Name: 'Timaru', Code: 'TIM' }
  ],
  'Wellington': [
    { Name: 'Wellington City', Code: 'WC' },
    { Name: 'Lower Hutt', Code: 'LH' }
  ]
}

const mockGetDistrictsByRegion = vi.fn((regionName: string) => {
  return mockDistricts[regionName as keyof typeof mockDistricts] || []
})

// Mock the dynamic import
vi.mock('../data/nzLocations', () => ({
  NZ_REGIONS: mockRegions,
  getDistrictsByRegion: mockGetDistrictsByRegion
}))

describe('useLocationSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty values when no initial values provided', async () => {
      const { result } = renderHook(() => useLocationSelector())
      
      expect(result.current.isLoading).toBe(true)
      expect(result.current.selectedRegion).toBe('')
      expect(result.current.selectedDistrict).toBe('')
      expect(result.current.isDistrictDisabled).toBe(true)
      expect(result.current.districts).toEqual([])
      expect(result.current.regions).toEqual([])
      
      // Wait for async loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.regions).toEqual(mockRegions)
    })

    it('should initialize with provided initial values', async () => {
      const { result } = renderHook(() => 
        useLocationSelector('Auckland', 'Auckland Central')
      )
      
      expect(result.current.selectedRegion).toBe('Auckland')
      expect(result.current.selectedDistrict).toBe('Auckland Central')
      
      // Wait for async loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.districts).toEqual(['Auckland Central', 'North Shore'])
      expect(mockGetDistrictsByRegion).toHaveBeenCalledWith('Auckland')
    })
  })

  describe('region selection', () => {
    it('should update region and load districts', async () => {
      const { result } = renderHook(() => useLocationSelector())
      
      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      act(() => {
        result.current.handleRegionChange('Canterbury')
      })
      
      expect(result.current.selectedRegion).toBe('Canterbury')
      expect(result.current.selectedDistrict).toBe('') // Should reset
      expect(result.current.districts).toEqual(['Christchurch', 'Timaru'])
      expect(result.current.isDistrictDisabled).toBe(false)
    })

    it('should reset district when region changes', async () => {
      const { result } = renderHook(() => 
        useLocationSelector('Auckland', 'Auckland Central')
      )
      
      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.selectedDistrict).toBe('Auckland Central')
      
      act(() => {
        result.current.handleRegionChange('Wellington')
      })
      
      expect(result.current.selectedRegion).toBe('Wellington')
      expect(result.current.selectedDistrict).toBe('') // Should be reset
      expect(result.current.districts).toEqual(['Wellington City', 'Lower Hutt'])
    })

    it('should clear districts when empty region selected', async () => {
      const { result } = renderHook(() => useLocationSelector())
      
      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      // First select a region
      act(() => {
        result.current.handleRegionChange('Auckland')
      })
      
      expect(result.current.districts.length).toBeGreaterThan(0)
      
      // Then clear it
      act(() => {
        result.current.handleRegionChange('')
      })
      
      expect(result.current.selectedRegion).toBe('')
      expect(result.current.districts).toEqual([])
      expect(result.current.isDistrictDisabled).toBe(true)
    })
  })

  describe('district selection', () => {
    it('should update selected district', async () => {
      const { result } = renderHook(() => useLocationSelector())
      
      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      // First select a region
      act(() => {
        result.current.handleRegionChange('Auckland')
      })
      
      // Then select a district
      act(() => {
        result.current.handleDistrictChange('North Shore')
      })
      
      expect(result.current.selectedDistrict).toBe('North Shore')
    })
  })

  describe('district disabled state', () => {
    it('should disable district when no region selected', async () => {
      const { result } = renderHook(() => useLocationSelector())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.isDistrictDisabled).toBe(true)
    })

    it('should enable district when region selected', async () => {
      const { result } = renderHook(() => useLocationSelector())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      act(() => {
        result.current.handleRegionChange('Auckland')
      })
      
      expect(result.current.isDistrictDisabled).toBe(false)
    })

    it('should disable district when region has no districts', async () => {
      // Mock a region with no districts
      mockGetDistrictsByRegion.mockReturnValueOnce([])
      
      const { result } = renderHook(() => useLocationSelector())
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      act(() => {
        result.current.handleRegionChange('UnknownRegion')
      })
      
      expect(result.current.isDistrictDisabled).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle import failure gracefully', async () => {
      // Create a new hook instance that will fail to import
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock a failed import
      vi.doMock('../data/nzLocations', () => {
        throw new Error('Import failed')
      })
      
      const { result } = renderHook(() => useLocationSelector())
      
      expect(result.current.isLoading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      
      expect(result.current.regions).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load location data:', expect.any(Error))
      
      consoleErrorSpy.mockRestore()
    })
  })
}) 