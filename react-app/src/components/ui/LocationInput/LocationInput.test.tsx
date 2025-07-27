import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils/test-utils'
import LocationInput from './LocationInput'

// Mock the auth context
const mockUser = {
  userId: 1,
  username: 'testuser',
  email: 'test@test.com',
  location: 'Auckland, North Island'
}

const mockUseAuth = vi.fn()

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock location utilities
vi.mock('../../../utils/locationUtils', () => ({
  parseLocation: vi.fn((location: string) => {
    if (location === 'Auckland, North Island') {
      return { region: 'North Island', district: 'Auckland' }
    }
    if (location === 'Wellington, North Island') {
      return { region: 'North Island', district: 'Wellington' }
    }
    return { region: null, district: null }
  }),
  combineLocation: vi.fn((region: string, district: string) => {
    if (region && district) {
      return `${district}, ${region}`
    }
    return region || district || ''
  })
}))

// Mock MUI icons
vi.mock('@mui/icons-material', () => ({
  LocationOn: vi.fn().mockImplementation(() => <div data-testid="location-icon" />)
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Setup localStorage mock in beforeEach instead of at module level

describe('LocationInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: mockUser })
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render with default props', () => {
      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Add location (optional)')
    })

    it('should render with custom label and placeholder', () => {
      render(
        <LocationInput 
          {...defaultProps}
          label="Your Location"
          placeholder="Enter your location"
        />
      )
      
      const input = screen.getByLabelText('Your Location')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Enter your location')
    })

    it('should display current value', () => {
      render(<LocationInput {...defaultProps} value="Current Location" />)
      
      const input = screen.getByDisplayValue('Current Location')
      expect(input).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<LocationInput {...defaultProps} disabled />)
      
      const input = screen.getByLabelText('Location')
      expect(input).toBeDisabled()
    })

    it('should show error state', () => {
      render(
        <LocationInput 
          {...defaultProps}
          error
          helperText="Location is required"
        />
      )
      
      const input = screen.getByLabelText('Location')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByText('Location is required')).toBeInTheDocument()
    })

    it('should mark as required', () => {
      render(<LocationInput {...defaultProps} required />)
      
      const input = screen.getByLabelText('Location *')
      expect(input).toBeInTheDocument()
    })

    it('should support fullWidth prop', () => {
      render(<LocationInput {...defaultProps} fullWidth={false} />)
      
      const input = screen.getByLabelText('Location')
      expect(input).toBeInTheDocument()
    })
  })

  describe('input handling', () => {
    it('should call onChange when value changes', () => {
      const onChange = vi.fn()
      render(<LocationInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.change(input, { target: { value: 'New Location' } })
      
      expect(onChange).toHaveBeenCalledWith('New Location')
    })

    it('should handle empty input', () => {
      const onChange = vi.fn()
      render(<LocationInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.change(input, { target: { value: '' } })
      
      expect(onChange).toHaveBeenCalledWith('')
    })
  })

  describe('suggestions functionality', () => {
    it('should show suggestions when input is focused', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(['Wellington, North Island', 'Christchurch, South Island'])
      )

      render(<LocationInput {...defaultProps} value="Test Location" />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
        expect(screen.getByText('Wellington, North Island')).toBeInTheDocument()
        expect(screen.getByText('Christchurch, South Island')).toBeInTheDocument()
      })
    })

    it('should show profile location suggestion when available', async () => {
      render(<LocationInput {...defaultProps} value="" />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
        expect(screen.getByText('From your profile')).toBeInTheDocument()
        expect(screen.getByTestId('location-icon')).toBeInTheDocument()
      })
    })

    it('should not show profile location when it matches current value', async () => {
      render(<LocationInput {...defaultProps} value="Auckland, North Island" />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.queryByText('Use profile location (Auckland, North Island)')).not.toBeInTheDocument()
      })
    })

    it('should not show profile suggestion when user has no location', async () => {
      mockUseAuth.mockReturnValue({ user: { ...mockUser, location: null } })
      
      render(<LocationInput {...defaultProps} value="" />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.queryByText(/Use profile location/)).not.toBeInTheDocument()
      })
    })

    it('should hide suggestions when clicking away', async () => {
      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
      })

      fireEvent.click(document.body)
      
      await waitFor(() => {
        expect(screen.queryByText('Use profile location (Auckland, North Island)')).not.toBeInTheDocument()
      })
    })

    it('should not show duplicate suggestions', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(['Auckland, North Island', 'Wellington, North Island'])
      )

      render(<LocationInput {...defaultProps} value="" />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        const profileSuggestions = screen.queryAllByText(/Auckland, North Island/)
        expect(profileSuggestions).toHaveLength(1) // Only profile suggestion, not duplicate
      })
    })
  })

  describe('suggestion selection', () => {
    it('should select profile location suggestion', async () => {
      const onChange = vi.fn()
      render(<LocationInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Use profile location (Auckland, North Island)'))
      
      expect(onChange).toHaveBeenCalledWith('Auckland, North Island')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'recentLocations',
        JSON.stringify(['Auckland, North Island'])
      )
    })

    it('should select recent location suggestion', async () => {
      const onChange = vi.fn()
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(['Wellington, North Island'])
      )

      render(<LocationInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Wellington, North Island')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Wellington, North Island'))
      
      expect(onChange).toHaveBeenCalledWith('Wellington, North Island')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'recentLocations',
        JSON.stringify(['Wellington, North Island'])
      )
    })

    it('should close suggestions after selection', async () => {
      const onChange = vi.fn()
      render(<LocationInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Use profile location (Auckland, North Island)'))
      
      await waitFor(() => {
        expect(screen.queryByText('Use profile location (Auckland, North Island)')).not.toBeInTheDocument()
      })
    })
  })

  describe('recent locations management', () => {
    it('should load recent locations from localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(['Wellington, North Island', 'Christchurch, South Island'])
      )

      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Wellington, North Island')).toBeInTheDocument()
        expect(screen.getByText('Christchurch, South Island')).toBeInTheDocument()
      })
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('recentLocations')
    })

    it('should handle localStorage errors gracefully', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      // Should not crash and show only profile suggestion
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
      })
    })

    it('should save location to recent locations', async () => {
      const onChange = vi.fn()
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(['Wellington, North Island'])
      )

      render(<LocationInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Use profile location (Auckland, North Island)'))
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'recentLocations',
        JSON.stringify(['Auckland, North Island', 'Wellington, North Island'])
      )
    })

    it('should limit recent locations to 5', async () => {
      const onChange = vi.fn()
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(['Loc1', 'Loc2', 'Loc3', 'Loc4', 'Loc5'])
      )

      render(<LocationInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Use profile location (Auckland, North Island)'))
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'recentLocations',
        JSON.stringify(['Auckland, North Island', 'Loc1', 'Loc2', 'Loc3', 'Loc4'])
      )
    })

    it('should move existing location to top of recent list', async () => {
      const onChange = vi.fn()
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(['Loc1', 'Auckland, North Island', 'Loc3'])
      )

      render(<LocationInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Use profile location (Auckland, North Island)'))
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'recentLocations',
        JSON.stringify(['Auckland, North Island', 'Loc1', 'Loc3'])
      )
    })

    it('should handle localStorage save errors gracefully', async () => {
      const onChange = vi.fn()
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage save error')
      })

      render(<LocationInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
      })

      // Should not crash when saving fails
      fireEvent.click(screen.getByText('Use profile location (Auckland, North Island)'))
      
      expect(onChange).toHaveBeenCalledWith('Auckland, North Island')
    })

    it('should not save empty locations', async () => {
      const onChange = vi.fn()
      
      // Simulate an empty location being selected somehow
      render(<LocationInput {...defaultProps} onChange={onChange} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.change(input, { target: { value: '' } })
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should support keyboard navigation', async () => {
      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
      })

      // Escape key should close suggestions
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
      
      await waitFor(() => {
        expect(screen.queryByText('Use profile location (Auckland, North Island)')).not.toBeInTheDocument()
      })
    })
  })

  describe('edge cases', () => {
    it('should handle user without profile location', async () => {
      mockUseAuth.mockReturnValue({ user: { ...mockUser, location: '' } })
      
      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.queryByText(/Use profile location/)).not.toBeInTheDocument()
      })
    })

    it('should handle unauthenticated user', async () => {
      mockUseAuth.mockReturnValue({ user: null })
      
      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      // Should still work but without profile suggestions
      await waitFor(() => {
        expect(screen.queryByText(/Use profile location/)).not.toBeInTheDocument()
      })
    })

    it('should handle malformed localStorage data', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')
      
      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      // Should not crash
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
      })
    })

    it('should handle empty suggestions list', async () => {
      mockUseAuth.mockReturnValue({ user: { ...mockUser, location: null } })
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]))
      
      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      // No suggestions should be shown
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })

    it('should show divider between profile and recent suggestions', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(['Wellington, North Island'])
      )

      render(<LocationInput {...defaultProps} />)
      
      const input = screen.getByLabelText('Location')
      fireEvent.focus(input)
      
      await waitFor(() => {
        expect(screen.getByText('Use profile location (Auckland, North Island)')).toBeInTheDocument()
        expect(screen.getByText('Wellington, North Island')).toBeInTheDocument()
        // MUI Divider should be present
        const dividers = document.querySelectorAll('.MuiDivider-root')
        expect(dividers.length).toBeGreaterThan(0)
      })
    })
  })
}) 