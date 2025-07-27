import { render, screen, fireEvent } from '../../../utils/test-utils'
import { vi } from 'vitest'
import Button from '../../../../components/ui/Button/Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders disabled state correctly', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByText('Disabled Button')
    expect(button).toBeDisabled()
  })

  it('shows loading state with spinner', () => {
    render(<Button isLoading loadingText="Loading...">Submit</Button>)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('applies different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('MuiButton-contained')

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('MuiButton-outlined')

    rerender(<Button variant="text">Text</Button>)
    expect(screen.getByRole('button')).toHaveClass('MuiButton-text')
  })

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Button size="small">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeSmall')

    rerender(<Button size="large">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('MuiButton-sizeLarge')
  })

  it('renders full width button when fullWidth prop is true', () => {
    render(<Button fullWidth>Full Width</Button>)
    expect(screen.getByRole('button')).toHaveClass('MuiButton-fullWidth')
  })

  it('disables button when in loading state', () => {
    render(<Button isLoading>Loading Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
}) 