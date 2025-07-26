import React, { useState } from 'react';
import { Box, Stack, Alert } from '@mui/material';
import { Button, Input, Text } from '../../ui';

export interface LoginFormData {
  usernameOrEmail: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  onRegisterClick?: () => void;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

interface LoginFormErrors {
  usernameOrEmail?: string;
  password?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onRegisterClick,
  isLoading = false,
  error = null,
  disabled = false,
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    usernameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (field: keyof LoginFormData, value: string): string | undefined => {
    switch (field) {
      case 'usernameOrEmail':
        if (!value.trim()) {
          return 'Email or username is required';
        }
        if (value.length < 3) {
          return 'Must be at least 3 characters';
        }
        // Check if it looks like an email for more specific validation
        if (value.includes('@')) {
          const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          if (!emailRegex.test(value)) {
            return 'Please enter a valid email address';
          }
          if (value.length > 100) {
            return 'Email must be less than 100 characters';
          }
        } else {
          // Username validation
          if (value.length > 20) {
            return 'Username must be less than 20 characters';
          }
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
            return 'Username can only contain letters, numbers, hyphens, and underscores';
          }
        }
        return undefined;
      case 'password':
        if (!value) {
          return 'Password is required';
        }
        // Match AuthService requirements: minimum 8 characters
        if (value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        if (value.length > 100) {
          return 'Password must be less than 100 characters';
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};
    
    newErrors.usernameOrEmail = validateField('usernameOrEmail', formData.usernameOrEmail);
    newErrors.password = validateField('password', formData.password);
    
    setErrors(newErrors);
    setTouched({ usernameOrEmail: true, password: true });
    
    return !newErrors.usernameOrEmail && !newErrors.password;
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Validate field if it's been touched
    if (touched[field]) {
      const fieldError = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: fieldError,
      }));
    }
  };

  const handleBlur = (field: keyof LoginFormData) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
    
    const fieldError = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: fieldError,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
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

        <Input
          fullWidth
          label="Email or Username"
          placeholder="Enter your email or username"
          value={formData.usernameOrEmail}
          onChange={handleInputChange('usernameOrEmail')}
          onBlur={handleBlur('usernameOrEmail')}
          error={touched.usernameOrEmail && !!errors.usernameOrEmail}
          helperText={touched.usernameOrEmail ? errors.usernameOrEmail : ''}
          required
          disabled={isLoading || disabled}
        />
        
        <Input
          fullWidth
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange('password')}
          onBlur={handleBlur('password')}
          error={touched.password && !!errors.password}
          helperText={touched.password ? errors.password : ''}
          required
          disabled={isLoading || disabled}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="primary"
          size="large"
          isLoading={isLoading}
          loadingText="Signing In..."
          disabled={disabled || isLoading}
        >
          Sign In
        </Button>

        {/* Register Link */}
        {onRegisterClick && (
          <Box sx={{ textAlign: 'center' }}>
            <Text variant="body2" sx={{ mb: 1 }}>
              Don't have an account?
            </Text>
            <Button
              variant="text"
              onClick={onRegisterClick}
              disabled={isLoading || disabled}
              sx={{ textTransform: 'none' }}
            >
              Create Account
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default LoginForm;
