import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils/test-utils'
import LoginForm from './LoginForm'

describe('LoginForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onRegisterClick: vi.fn(),
    isLoading: false,
    error: null,
    disabled: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render all form elements', () => {
      render(<LoginForm {...defaultProps} />)
      
      expect(screen.getByLabelText('Email or Username')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })

    it('should render register section when onRegisterClick is provided', () => {
      render(<LoginForm {...defaultProps} />)
      
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    })

    it('should not render register section when onRegisterClick is not provided', () => {
      render(<LoginForm {...defaultProps} onRegisterClick={undefined} />)
      
      expect(screen.queryByText("Don't have an account?")).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Create Account' })).not.toBeInTheDocument()
    })

    it('should show error message when error prop is provided', () => {
      render(<LoginForm {...defaultProps} error="Invalid credentials" />)
      
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('should show validation error for empty username/email field', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.getByText('Email or username is required')).toBeInTheDocument()
      })
    })

    it('should show validation error for short username/email', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      fireEvent.change(usernameInput, { target: { value: 'ab' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.getByText('Must be at least 3 characters')).toBeInTheDocument()
      })
    })

    it('should validate email format correctly', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      fireEvent.change(usernameInput, { target: { value: 'invalid-email@' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('should accept valid email format', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      fireEvent.change(usernameInput, { target: { value: 'user@example.com' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
      })
    })

    it('should validate username format correctly', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      fireEvent.change(usernameInput, { target: { value: 'user@name!' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.getByText('Username can only contain letters, numbers, hyphens, and underscores')).toBeInTheDocument()
      })
    })

    it('should accept valid username format', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      fireEvent.change(usernameInput, { target: { value: 'valid_user-123' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.queryByText(/Username can only contain/)).not.toBeInTheDocument()
      })
    })

    it('should show validation error for empty password', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.blur(passwordInput)
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })
    })

    it('should show validation error for short password', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(passwordInput, { target: { value: '1234567' } })
      fireEvent.blur(passwordInput)
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })

    it('should accept valid password', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(passwordInput, { target: { value: 'validpassword123' } })
      fireEvent.blur(passwordInput)
      
      await waitFor(() => {
        expect(screen.queryByText('Password must be at least 8 characters')).not.toBeInTheDocument()
      })
    })

    it('should show validation error for too long email', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      const longEmail = 'a'.repeat(95) + '@example.com' // > 100 chars
      fireEvent.change(usernameInput, { target: { value: longEmail } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.getByText('Email must be less than 100 characters')).toBeInTheDocument()
      })
    })

    it('should show validation error for too long username', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      const longUsername = 'a'.repeat(25) // > 20 chars
      fireEvent.change(usernameInput, { target: { value: longUsername } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.getByText('Username must be less than 20 characters')).toBeInTheDocument()
      })
    })

    it('should show validation error for too long password', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      const longPassword = 'a'.repeat(105) // > 100 chars
      fireEvent.change(passwordInput, { target: { value: longPassword } })
      fireEvent.blur(passwordInput)
      
      await waitFor(() => {
        expect(screen.getByText('Password must be less than 100 characters')).toBeInTheDocument()
      })
    })
  })

  describe('real-time validation', () => {
    it('should validate in real-time after field is touched', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      
      // Touch the field first
      fireEvent.blur(usernameInput)
      await waitFor(() => {
        expect(screen.getByText('Email or username is required')).toBeInTheDocument()
      })
      
      // Now type - should validate in real-time
      fireEvent.change(usernameInput, { target: { value: 'valid_user' } })
      
      await waitFor(() => {
        expect(screen.queryByText('Email or username is required')).not.toBeInTheDocument()
      })
    })

    it('should not show validation errors before field is touched', () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      fireEvent.change(usernameInput, { target: { value: '' } })
      
      expect(screen.queryByText('Email or username is required')).not.toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should call onSubmit with correct data when form is valid', async () => {
      const onSubmit = vi.fn()
      render(<LoginForm {...defaultProps} onSubmit={onSubmit} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          usernameOrEmail: 'testuser',
          password: 'password123'
        })
      })
    })

    it('should not call onSubmit when form is invalid', async () => {
      const onSubmit = vi.fn()
      render(<LoginForm {...defaultProps} onSubmit={onSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Email or username is required')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })
      
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should prevent default form submission', async () => {
      const preventDefault = vi.fn()
      render(<LoginForm {...defaultProps} />)
      
      const form = screen.getByRole('button', { name: 'Sign In' }).closest('form')!
      fireEvent.submit(form, { preventDefault })
      
      expect(preventDefault).toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should disable inputs and show loading button when isLoading is true', () => {
      render(<LoginForm {...defaultProps} isLoading />)
      
      expect(screen.getByLabelText('Email or Username')).toBeDisabled()
      expect(screen.getByLabelText('Password')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Signing In...' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeDisabled()
    })

    it('should show normal state when isLoading is false', () => {
      render(<LoginForm {...defaultProps} isLoading={false} />)
      
      expect(screen.getByLabelText('Email or Username')).not.toBeDisabled()
      expect(screen.getByLabelText('Password')).not.toBeDisabled()
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Account' })).not.toBeDisabled()
    })
  })

  describe('disabled state', () => {
    it('should disable all inputs and buttons when disabled is true', () => {
      render(<LoginForm {...defaultProps} disabled />)
      
      expect(screen.getByLabelText('Email or Username')).toBeDisabled()
      expect(screen.getByLabelText('Password')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeDisabled()
    })
  })

  describe('register functionality', () => {
    it('should call onRegisterClick when register button is clicked', () => {
      const onRegisterClick = vi.fn()
      render(<LoginForm {...defaultProps} onRegisterClick={onRegisterClick} />)
      
      const registerButton = screen.getByRole('button', { name: 'Create Account' })
      fireEvent.click(registerButton)
      
      expect(onRegisterClick).toHaveBeenCalled()
    })

    it('should not call onRegisterClick when register button is disabled', () => {
      const onRegisterClick = vi.fn()
      render(<LoginForm {...defaultProps} onRegisterClick={onRegisterClick} disabled />)
      
      const registerButton = screen.getByRole('button', { name: 'Create Account' })
      fireEvent.click(registerButton)
      
      expect(onRegisterClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper form labels and structure', () => {
      render(<LoginForm {...defaultProps} />)
      
      expect(screen.getByLabelText('Email or Username')).toHaveAttribute('required')
      expect(screen.getByLabelText('Password')).toHaveAttribute('required')
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    })

    it('should associate error messages with form fields', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(usernameInput).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByText('Email or username is required')).toBeInTheDocument()
      })
    })

    it('should have proper button types', () => {
      render(<LoginForm {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: 'Sign In' })).toHaveAttribute('type', 'submit')
      expect(screen.getByRole('button', { name: 'Create Account' })).not.toHaveAttribute('type', 'submit')
    })
  })

  describe('edge cases', () => {
    it('should handle empty strings vs undefined for validation', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      
      // Test empty string
      fireEvent.change(usernameInput, { target: { value: '   ' } }) // spaces only
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.getByText('Email or username is required')).toBeInTheDocument()
      })
    })

    it('should handle special characters in email validation correctly', async () => {
      render(<LoginForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      
      // Test valid email with allowed special characters
      fireEvent.change(usernameInput, { target: { value: 'user.name+tag@example.co.uk' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
      })
    })

    it('should handle form submission with trimmed values', async () => {
      const onSubmit = vi.fn()
      render(<LoginForm {...defaultProps} onSubmit={onSubmit} />)
      
      const usernameInput = screen.getByLabelText('Email or Username')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: 'Sign In' })
      
      fireEvent.change(usernameInput, { target: { value: '  testuser  ' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          usernameOrEmail: '  testuser  ', // Form doesn't trim on submission, validation does
          password: 'password123'
        })
      })
    })
  })
}) 