import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../test/utils/test-utils'
import RegisterForm from './RegisterForm'

describe('RegisterForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onLoginClick: vi.fn(),
    isLoading: false,
    error: null,
    disabled: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(<RegisterForm {...defaultProps} />)
      
      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    })

    it('should render login link when onLoginClick is provided', () => {
      render(<RegisterForm {...defaultProps} />)
      
      expect(screen.getByText('Already have an account?')).toBeInTheDocument()
      expect(screen.getByText('Sign in here!')).toBeInTheDocument()
    })

    it('should not render login link when onLoginClick is not provided', () => {
      render(<RegisterForm {...defaultProps} onLoginClick={undefined} />)
      
      expect(screen.queryByText('Already have an account?')).not.toBeInTheDocument()
    })

    it('should show error message when error prop is provided', () => {
      render(<RegisterForm {...defaultProps} error="Registration failed" />)
      
      expect(screen.getByText('Registration failed')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  describe('password strength indicator', () => {
    it('should not show password strength indicator for empty password', () => {
      render(<RegisterForm {...defaultProps} />)
      
      expect(screen.queryByText('Password strength:')).not.toBeInTheDocument()
    })

    it('should show weak password strength for basic password', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(passwordInput, { target: { value: 'weak' } })
      
      await waitFor(() => {
        expect(screen.getByText('Password strength:')).toBeInTheDocument()
        expect(screen.getByText('Weak')).toBeInTheDocument()
      })
    })

    it('should show strong password strength for complex password', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
      
      await waitFor(() => {
        expect(screen.getByText('Password strength:')).toBeInTheDocument()
        expect(screen.getByText('Strong')).toBeInTheDocument()
      })
    })

    it('should show password requirements', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(passwordInput, { target: { value: 'test' } })
      
      await waitFor(() => {
        expect(screen.getByText(/Required:/)).toBeInTheDocument()
        expect(screen.getByText(/Optional:/)).toBeInTheDocument()
      })
    })

    it('should show checkmarks for met requirements', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(passwordInput, { target: { value: 'StrongPassword123' } })
      
      await waitFor(() => {
        const requirementsText = screen.getByText(/Required:/)
        expect(requirementsText.textContent).toContain('✓ 8+ chars')
        expect(requirementsText.textContent).toContain('✓ uppercase')
        expect(requirementsText.textContent).toContain('✓ lowercase')
        expect(requirementsText.textContent).toContain('✓ number')
      })
    })

    it('should show warning for invalid characters', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(passwordInput, { target: { value: 'Password123&' } }) // & is not allowed
      
      await waitFor(() => {
        expect(screen.getByText('⚠ Invalid characters detected')).toBeInTheDocument()
      })
    })
  })

  describe('form validation', () => {
    it('should validate required fields', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const submitButton = screen.getByRole('button', { name: 'Create Account' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument()
        expect(screen.getByText('Last name is required')).toBeInTheDocument()
        expect(screen.getByText('Username is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
      })
    })

    it('should validate first name format', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const firstNameInput = screen.getByLabelText('First Name')
      
      // Test invalid characters
      fireEvent.change(firstNameInput, { target: { value: 'John123' } })
      fireEvent.blur(firstNameInput)
      
      await waitFor(() => {
        expect(screen.getByText(/First name can only contain letters/)).toBeInTheDocument()
      })
      
      // Test valid name
      fireEvent.change(firstNameInput, { target: { value: "Mary-Jane O'Connor" } })
      fireEvent.blur(firstNameInput)
      
      await waitFor(() => {
        expect(screen.queryByText(/First name can only contain letters/)).not.toBeInTheDocument()
      })
    })

    it('should validate last name format', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const lastNameInput = screen.getByLabelText('Last Name')
      
      // Test invalid characters
      fireEvent.change(lastNameInput, { target: { value: 'Smith@' } })
      fireEvent.blur(lastNameInput)
      
      await waitFor(() => {
        expect(screen.getByText(/Last name can only contain letters/)).toBeInTheDocument()
      })
    })

    it('should validate username format', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Username')
      
      // Test short username
      fireEvent.change(usernameInput, { target: { value: 'ab' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument()
      })
      
      // Test invalid characters
      fireEvent.change(usernameInput, { target: { value: 'user@name' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.getByText(/Username can only contain letters/)).toBeInTheDocument()
      })
      
      // Test valid username
      fireEvent.change(usernameInput, { target: { value: 'valid_user-123' } })
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(screen.queryByText(/Username can only contain letters/)).not.toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText('Email')
      
      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.blur(emailInput)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
      
      // Test valid email
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.blur(emailInput)
      
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
      })
    })

    it('should validate password requirements', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      
      // Test weak password
      fireEvent.change(passwordInput, { target: { value: 'weak' } })
      fireEvent.blur(passwordInput)
      
      await waitFor(() => {
        expect(screen.getByText(/Password must contain at least one uppercase letter/)).toBeInTheDocument()
      })
      
      // Test valid password
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123' } })
      fireEvent.blur(passwordInput)
      
      await waitFor(() => {
        expect(screen.queryByText(/Password must contain at least one uppercase letter/)).not.toBeInTheDocument()
      })
    })

    it('should validate password confirmation', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      
      fireEvent.change(passwordInput, { target: { value: 'Password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123' } })
      fireEvent.blur(confirmPasswordInput)
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
      
      // Test matching passwords
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })
      fireEvent.blur(confirmPasswordInput)
      
      await waitFor(() => {
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument()
      })
    })

    it('should validate field length limits', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const firstNameInput = screen.getByLabelText('First Name')
      const longName = 'a'.repeat(55) // > 50 chars
      
      fireEvent.change(firstNameInput, { target: { value: longName } })
      fireEvent.blur(firstNameInput)
      
      await waitFor(() => {
        expect(screen.getByText('First name must be less than 50 characters')).toBeInTheDocument()
      })
    })
  })

  describe('real-time validation', () => {
    it('should validate in real-time after field is touched', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Username')
      
      // Touch the field first
      fireEvent.blur(usernameInput)
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument()
      })
      
      // Now type - should validate in real-time
      fireEvent.change(usernameInput, { target: { value: 'validuser' } })
      
      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument()
      })
    })

    it('should update password confirmation validation when password changes', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      
      // Set initial passwords that match
      fireEvent.change(passwordInput, { target: { value: 'Password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })
      fireEvent.blur(confirmPasswordInput)
      
      // Change password - confirmation should now be invalid
      fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } })
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'StrongPass123',
      confirmPassword: 'StrongPass123'
    }

    it('should call onSubmit with correct data when form is valid', async () => {
      const onSubmit = vi.fn()
      render(<RegisterForm {...defaultProps} onSubmit={onSubmit} />)
      
      // Fill out the form
      fireEvent.change(screen.getByLabelText('First Name'), { target: { value: validFormData.firstName } })
      fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: validFormData.lastName } })
      fireEvent.change(screen.getByLabelText('Username'), { target: { value: validFormData.username } })
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: validFormData.email } })
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: validFormData.password } })
      fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: validFormData.confirmPassword } })
      
      const submitButton = screen.getByRole('button', { name: 'Create Account' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(validFormData)
      })
    })

    it('should not call onSubmit when form is invalid', async () => {
      const onSubmit = vi.fn()
      render(<RegisterForm {...defaultProps} onSubmit={onSubmit} />)
      
      const submitButton = screen.getByRole('button', { name: 'Create Account' })
      fireEvent.click(submitButton)
      
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should prevent default form submission', async () => {
      const preventDefault = vi.fn()
      render(<RegisterForm {...defaultProps} />)
      
      const form = screen.getByRole('button', { name: 'Create Account' }).closest('form')!
      fireEvent.submit(form, { preventDefault })
      
      expect(preventDefault).toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should disable all inputs and show loading button when isLoading is true', () => {
      render(<RegisterForm {...defaultProps} isLoading />)
      
      expect(screen.getByLabelText('First Name')).toBeDisabled()
      expect(screen.getByLabelText('Last Name')).toBeDisabled()
      expect(screen.getByLabelText('Username')).toBeDisabled()
      expect(screen.getByLabelText('Email')).toBeDisabled()
      expect(screen.getByLabelText('Password')).toBeDisabled()
      expect(screen.getByLabelText('Confirm Password')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Creating Account...' })).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('should disable all inputs and buttons when disabled is true', () => {
      render(<RegisterForm {...defaultProps} disabled />)
      
      expect(screen.getByLabelText('First Name')).toBeDisabled()
      expect(screen.getByLabelText('Last Name')).toBeDisabled()
      expect(screen.getByLabelText('Username')).toBeDisabled()
      expect(screen.getByLabelText('Email')).toBeDisabled()
      expect(screen.getByLabelText('Password')).toBeDisabled()
      expect(screen.getByLabelText('Confirm Password')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeDisabled()
    })
  })

  describe('login functionality', () => {
    it('should call onLoginClick when login link is clicked', () => {
      const onLoginClick = vi.fn()
      render(<RegisterForm {...defaultProps} onLoginClick={onLoginClick} />)
      
      const loginLink = screen.getByText('Sign in here!')
      fireEvent.click(loginLink)
      
      expect(onLoginClick).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper form labels and structure', () => {
      render(<RegisterForm {...defaultProps} />)
      
      expect(screen.getByLabelText('First Name')).toHaveAttribute('required')
      expect(screen.getByLabelText('Last Name')).toHaveAttribute('required')
      expect(screen.getByLabelText('Username')).toHaveAttribute('required')
      expect(screen.getByLabelText('Email')).toHaveAttribute('required')
      expect(screen.getByLabelText('Password')).toHaveAttribute('required')
      expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('required')
      
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
      expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('type', 'password')
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    })

    it('should associate error messages with form fields', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const usernameInput = screen.getByLabelText('Username')
      fireEvent.blur(usernameInput)
      
      await waitFor(() => {
        expect(usernameInput).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByText('Username is required')).toBeInTheDocument()
      })
    })

    it('should have proper button type', () => {
      render(<RegisterForm {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: 'Create Account' })).toHaveAttribute('type', 'submit')
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in password validation', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      
      // Test allowed special characters
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123!@#$%*-_+=' } })
      fireEvent.blur(passwordInput)
      
      await waitFor(() => {
        expect(screen.queryByText(/Password can only contain/)).not.toBeInTheDocument()
      })
      
      // Test disallowed special characters
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123&' } })
      fireEvent.blur(passwordInput)
      
      await waitFor(() => {
        expect(screen.getByText(/Password can only contain/)).toBeInTheDocument()
      })
    })

    it('should handle whitespace in name fields correctly', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const firstNameInput = screen.getByLabelText('First Name')
      
      // Test with only whitespace
      fireEvent.change(firstNameInput, { target: { value: '   ' } })
      fireEvent.blur(firstNameInput)
      
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument()
      })
    })

    it('should update password strength indicator dynamically', async () => {
      render(<RegisterForm {...defaultProps} />)
      
      const passwordInput = screen.getByLabelText('Password')
      
      // Start with weak password
      fireEvent.change(passwordInput, { target: { value: 'weak' } })
      await waitFor(() => {
        expect(screen.getByText('Weak')).toBeInTheDocument()
      })
      
      // Improve to strong password
      fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } })
      await waitFor(() => {
        expect(screen.getByText('Strong')).toBeInTheDocument()
        expect(screen.queryByText('Weak')).not.toBeInTheDocument()
      })
    })
  })
}) 