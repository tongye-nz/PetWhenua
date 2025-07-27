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
      hasAllowedSpecialChar: /[!@#$%*\-_+=]/.test(password),
      hasOnlyAllowedChars: /^[a-zA-Z0-9!@#$%*\-_+=]*$/.test(password),
    };

    // Required criteria (80 points total)
    if (checks.length) score += 25;
    if (checks.hasUpperCase) score += 25;
    if (checks.hasLowerCase) score += 25;
    if (checks.hasNumbers) score += 25;
    
    // Bonus for allowed special chars (20 points)
    if (checks.hasAllowedSpecialChar && checks.hasOnlyAllowedChars) score += 20;
    
    // Penalty for invalid characters
    if (!checks.hasOnlyAllowedChars) score = Math.max(0, score - 40);

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
  
  // Normalize progress bar value so "Strong" always shows 100%
  const getProgressValue = () => {
    if (label === 'Strong') return 100;
    if (label === 'Fair') return Math.min(score * 1.25, 99); // Scale 40-79 to roughly 50-99
    return Math.min(score * 2, 39); // Scale 0-39 to 0-39
  };

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
        value={getProgressValue()} 
        color={color}
        sx={{ height: 4, borderRadius: 2 }}
      />
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Required: {checks.length ? '✓' : '✗'} 8+ chars, {checks.hasUpperCase ? '✓' : '✗'} uppercase, {checks.hasLowerCase ? '✓' : '✗'} lowercase, {checks.hasNumbers ? '✓' : '✗'} number
        </Typography>
        {password && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Optional: {checks.hasAllowedSpecialChar ? '✓' : '○'} special chars (!@#$%*-_+=)
            {!checks.hasOnlyAllowedChars && (
              <Typography component="span" color="error.main" sx={{ ml: 1, fontWeight: 'bold' }}>
                ⚠ Invalid characters detected
              </Typography>
            )}
          </Typography>
        )}
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
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Real-time field validation
  const validateField = (field: keyof RegisterFormData, value: string): string | undefined => {
    switch (field) {
      case 'username':
        if (!value.trim()) {
          return 'Username is required';
        }
        if (value.length < 3) {
          return 'Username must be at least 3 characters';
        }
        if (value.length > 20) {
          return 'Username must be less than 20 characters';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return 'Username can only contain letters, numbers, hyphens, and underscores';
        }
        return undefined;

      case 'email': {
        if (!value.trim()) {
          return 'Email is required';
        }
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        if (value.length > 100) {
          return 'Email must be less than 100 characters';
        }
        return undefined;
      }

      case 'password': {
        if (!value) {
          return 'Password is required';
        }
        if (value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        if (value.length > 100) {
          return 'Password must be less than 100 characters';
        }
        
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const allowedSpecialChars = /^[a-zA-Z0-9!@#$%*\-_+=]*$/;
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        if (!allowedSpecialChars.test(value)) {
          return 'Password can only contain letters, numbers, and these special characters: !@#$%*-_+=';
        }
        return undefined;
      }

      case 'confirmPassword':
        if (!value) {
          return 'Please confirm your password';
        }
        if (formData.password !== value) {
          return 'Passwords do not match';
        }
        return undefined;

      case 'firstName':
        if (!value.trim()) {
          return 'First name is required';
        }
        if (value.length > 50) {
          return 'First name must be less than 50 characters';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          return 'First name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return undefined;

      case 'lastName':
        if (!value.trim()) {
          return 'Last name is required';
        }
        if (value.length > 50) {
          return 'Last name must be less than 50 characters';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};
    
    newErrors.username = validateField('username', formData.username);
    newErrors.email = validateField('email', formData.email);
    newErrors.password = validateField('password', formData.password);
    newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);
    newErrors.firstName = validateField('firstName', formData.firstName);
    newErrors.lastName = validateField('lastName', formData.lastName);

    setErrors(newErrors);
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      firstName: true,
      lastName: true,
    });
    
    return Object.values(newErrors).every(error => !error);
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
    const value = event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Real-time validation for touched fields
    if (touched[field]) {
      const fieldError = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: fieldError,
      }));
    }
  };

  const handleBlur = (field: keyof RegisterFormData) => () => {
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
            onBlur={handleBlur('firstName')}
            error={touched.firstName && !!errors.firstName}
            helperText={touched.firstName ? errors.firstName : ''}
            required
            disabled={isLoading || disabled}
          />
          
          <Input
            fullWidth
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            onBlur={handleBlur('lastName')}
            error={touched.lastName && !!errors.lastName}
            helperText={touched.lastName ? errors.lastName : ''}
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
          onBlur={handleBlur('username')}
          error={touched.username && !!errors.username}
          helperText={touched.username ? errors.username : ''}
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
          onBlur={handleBlur('email')}
          error={touched.email && !!errors.email}
          helperText={touched.email ? errors.email : ''}
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
          onBlur={handleBlur('password')}
          error={touched.password && !!errors.password}
          helperText={touched.password ? errors.password : ''}
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
          onBlur={handleBlur('confirmPassword')}
          error={touched.confirmPassword && !!errors.confirmPassword}
          helperText={touched.confirmPassword ? errors.confirmPassword : ''}
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
