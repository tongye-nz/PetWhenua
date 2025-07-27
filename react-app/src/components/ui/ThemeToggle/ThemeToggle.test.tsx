import { render, screen, fireEvent } from '../../../test/utils/test-utils'
import { vi } from 'vitest'
import { useTheme } from '../../../contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'

// Mock the useTheme hook
vi.mock('../../../contexts/ThemeContext', () => ({
  useTheme: vi.fn()
}))

// Mock all MUI icons
vi.mock('@mui/icons-material', () => ({
  LightMode: vi.fn().mockImplementation(() => <div data-testid="LightMode" />),
  DarkMode: vi.fn().mockImplementation(() => <div data-testid="DarkMode" />)
}))

describe('ThemeToggle Component', () => {
  const mockToggleTheme = vi.fn()

  beforeEach(() => {
    // Reset mock function calls
    mockToggleTheme.mockClear()
    vi.mocked(useTheme).mockClear()
  })

  it('renders without label by default', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme,
      isDarkMode: false
    })

    render(<ThemeToggle />)
    
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.queryByText(/mode/i)).not.toBeInTheDocument()
  })

  it('renders with label when showLabel is true', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme,
      isDarkMode: false
    })

    render(<ThemeToggle showLabel />)
    
    expect(screen.getByText('Light Mode')).toBeInTheDocument()
  })

  it('shows correct label text based on theme mode', () => {
    // Test light mode
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme,
      isDarkMode: false
    })

    const { rerender } = render(<ThemeToggle showLabel />)
    expect(screen.getByText('Light Mode')).toBeInTheDocument()

    // Test dark mode
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      toggleTheme: mockToggleTheme,
      isDarkMode: true
    })

    rerender(<ThemeToggle showLabel />)
    expect(screen.getByText('Dark Mode')).toBeInTheDocument()
  })

  it('calls toggleTheme when switch is clicked', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme,
      isDarkMode: false
    })

    render(<ThemeToggle />)
    
    fireEvent.click(screen.getByRole('checkbox'))
    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('shows correct tooltip based on current theme', () => {
    // Test light mode tooltip
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme,
      isDarkMode: false
    })

    const { rerender } = render(<ThemeToggle />)
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument()

    // Test dark mode tooltip
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      toggleTheme: mockToggleTheme,
      isDarkMode: true
    })

    rerender(<ThemeToggle />)
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument()
  })

  it('renders theme icons correctly', () => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'light',
      toggleTheme: mockToggleTheme,
      isDarkMode: false
    })

    render(<ThemeToggle />)
    
    // Only LightMode icon should be visible in light mode
    expect(screen.getByTestId('LightMode')).toBeInTheDocument()
    
    // Switch to dark mode
    vi.mocked(useTheme).mockReturnValue({
      mode: 'dark',
      toggleTheme: mockToggleTheme,
      isDarkMode: true
    })
    
    // Re-render to see dark mode icon
    render(<ThemeToggle />)
    expect(screen.getByTestId('DarkMode')).toBeInTheDocument()
  })
}) 