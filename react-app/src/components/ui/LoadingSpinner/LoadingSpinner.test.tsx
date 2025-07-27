import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils/test-utils'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  describe('basic rendering', () => {
    it('should render spinner with default props', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByRole('progressbar')
      expect(spinner).toBeInTheDocument()
    })

    it('should render with custom aria-label', () => {
      render(<LoadingSpinner aria-label="Loading content" />)
      
      const spinner = screen.getByLabelText('Loading content')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('size variants', () => {
    it('should render small size spinner', () => {
      render(<LoadingSpinner size="small" data-testid="spinner" />)
      
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
      // Small size should be 20px
      expect(spinner).toHaveStyle({ width: '20px', height: '20px' })
    })

    it('should render medium size spinner (default)', () => {
      render(<LoadingSpinner size="medium" data-testid="spinner" />)
      
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
      // Medium size should be 40px
      expect(spinner).toHaveStyle({ width: '40px', height: '40px' })
    })

    it('should render large size spinner', () => {
      render(<LoadingSpinner size="large" data-testid="spinner" />)
      
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
      // Large size should be 60px
      expect(spinner).toHaveStyle({ width: '60px', height: '60px' })
    })

    it('should default to medium size when no size specified', () => {
      render(<LoadingSpinner data-testid="spinner" />)
      
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveStyle({ width: '40px', height: '40px' })
    })
  })

  describe('centered layout', () => {
    it('should render non-centered by default', () => {
      render(<LoadingSpinner />)
      
      // Should not have a wrapper Box when not centered
      const spinner = screen.getByRole('progressbar')
      expect(spinner.parentElement).not.toHaveClass('MuiBox-root')
    })

    it('should render centered when centered prop is true', () => {
      render(<LoadingSpinner centered data-testid="spinner" />)
      
      const spinner = screen.getByTestId('spinner')
      const container = spinner.parentElement
      
      expect(container).toHaveClass('MuiBox-root')
      expect(container).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100px'
      })
    })

    it('should apply custom container props when centered', () => {
      render(
        <LoadingSpinner 
          centered 
          containerProps={{ 
            sx: { backgroundColor: 'red' },
            className: 'custom-container'
          }} 
        />
      )
      
      const container = screen.getByRole('progressbar').parentElement
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('MuiBox-root')
      expect(container).toHaveClass('custom-container')
    })
  })

  describe('props forwarding', () => {
    it('should forward CircularProgress props', () => {
      render(
        <LoadingSpinner 
          color="secondary"
          variant="determinate"
          value={50}
          data-testid="spinner"
        />
      )
      
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('MuiCircularProgress-colorSecondary')
    })

    it('should handle thickness prop', () => {
      render(<LoadingSpinner thickness={2} data-testid="spinner" />)
      
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should forward additional props to CircularProgress', () => {
      render(<LoadingSpinner data-testid="spinner" title="Loading..." />)
      
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveAttribute('title', 'Loading...')
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LoadingSpinner aria-label="Loading..." />)
      
      const spinner = screen.getByRole('progressbar')
      expect(spinner).toHaveAttribute('aria-label', 'Loading...')
    })

    it('should support aria-describedby', () => {
      render(<LoadingSpinner aria-describedby="loading-description" />)
      
      const spinner = screen.getByRole('progressbar')
      expect(spinner).toHaveAttribute('aria-describedby', 'loading-description')
    })
  })

  describe('edge cases', () => {
    it('should handle all size and centered combinations', () => {
      const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large']
      
      sizes.forEach(size => {
        const { unmount } = render(
          <LoadingSpinner 
            size={size} 
            centered 
            data-testid={`spinner-${size}`} 
          />
        )
        
        const spinner = screen.getByTestId(`spinner-${size}`)
        expect(spinner).toBeInTheDocument()
        expect(spinner.parentElement).toHaveClass('MuiBox-root')
        
        unmount()
      })
    })

    it('should handle custom className', () => {
      render(<LoadingSpinner className="custom-spinner" data-testid="spinner" />)
      
      const spinner = screen.getByTestId('spinner')
      expect(spinner).toHaveClass('custom-spinner')
    })
  })
}) 