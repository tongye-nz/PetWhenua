import React, { useState } from 'react';
import { Box, Stack, Alert, Typography, LinearProgress } from '@mui/material';
import { Button, Input } from '../../ui';

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface RegisterFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  onLoginClick?: () => void;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

// Password strength indicator component
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    if (checks.length) score += 20;
    if (checks.hasUpperCase) score += 20;
    if (checks.hasLowerCase) score += 20;
    if (checks.hasNumbers) score += 20;
    if (checks.hasSpecialChar) score += 20;

    return { score, checks };
  };

  if (!password) return null;

  const { score, checks } = getPasswordStrength(password);
  
  const getStrengthLabel = () => {
    if (score < 40) return { label: 'Weak', color: 'error' as const };
    if (score < 80) return { label: 'Fair', color: 'warning' as const };
    return { label: 'Strong', color: 'success' as const };
  };

  const { label, color } = getStrengthLabel();

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Password strength:
        </Typography>
        <Typography variant="caption" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
          {label}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={score} 
        color={color}
        sx={{ height: 4, borderRadius: 2 }}
      />
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Requirements: {checks.length ? '✓' : '✗'} 8+ chars, {checks.hasUpperCase ? '✓' : '✗'} uppercase, {checks.hasLowerCase ? '✓' : '✗'} lowercase, {checks.hasNumbers ? '✓' : '✗'} number
        </Typography>
      </Box>
    </Box>
  );
};

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onLoginClick,
  isLoading = false,
  error = null,
  disabled = false,
}) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must be less than 100 characters';
    }

    // Enhanced password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 100) {
      newErrors.password = 'Password must be less than 100 characters';
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumbers = /\d/.test(formData.password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={2}>
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {/* Name Fields */}
        <Stack direction="row" spacing={2}>
          <Input
            fullWidth
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
            disabled={isLoading || disabled}
          />
          
          <Input
            fullWidth
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
            disabled={isLoading || disabled}
          />
        </Stack>

        {/* Username Field */}
        <Input
          fullWidth
          label="Username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleInputChange('username')}
          error={!!errors.username}
          helperText={errors.username}
          required
          disabled={isLoading || disabled}
        />

        {/* Email Field */}
        <Input
          fullWidth
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          required
          disabled={isLoading || disabled}
        />

        {/* Password Fields */}
        <Input
          fullWidth
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={!!errors.password}
          helperText={errors.password}
          required
          disabled={isLoading || disabled}
        />

        <PasswordStrengthIndicator password={formData.password} />

        <Input
          fullWidth
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          required
          disabled={isLoading || disabled}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="primary"
          size="large"
          isLoading={isLoading}
          loadingText="Creating Account..."
          disabled={disabled || isLoading}
        >
          Create Account
        </Button>

        {onLoginClick && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Typography 
                component="span" 
                sx={{ 
                  color: 'primary.main', 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                    color: 'primary.dark'
                  }
                }}
                onClick={onLoginClick}
              >
                Sign in here!
              </Typography>
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default RegisterForm;
