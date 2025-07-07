import React, { useState } from 'react';
import { Box, Stack, Alert, Typography } from '@mui/material';
import { Button, Input } from '../../';

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
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
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
          disabled={disabled}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
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
