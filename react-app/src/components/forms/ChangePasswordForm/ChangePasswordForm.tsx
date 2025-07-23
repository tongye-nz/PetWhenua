import React, { useState } from 'react';
import { Box, Stack, Alert, Typography, LinearProgress } from '@mui/material';
import { Button, Input } from '../../ui';
import { authService } from '../../../api/auth.api';

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  general?: string;
}

export interface ChangePasswordFormProps {
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
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

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSuccess,
  onCancel,
  disabled = false,
}) => {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [errors, setErrors] = useState<ChangePasswordFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ChangePasswordFormErrors = {};

    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters';
    } else if (formData.newPassword.length > 100) {
      newErrors.newPassword = 'New password must be less than 100 characters';
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.newPassword);
      const hasLowerCase = /[a-z]/.test(formData.newPassword);
      const hasNumbers = /\d/.test(formData.newPassword);
      const allowedSpecialChars = /^[a-zA-Z0-9!@#$%*\-_+=]*$/;
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        newErrors.newPassword = 'New password must contain at least one uppercase letter, one lowercase letter, and one number';
      } else if (!allowedSpecialChars.test(formData.newPassword)) {
        newErrors.newPassword = 'New password can only contain letters, numbers, and these special characters: !@#$%*-_+=';
      }
    }

    // Confirm password validation
    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'New passwords do not match';
    }

    // Check if new password is different from current password (basic check)
    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from your current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ChangePasswordFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});

      const response = await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });

      if (response.success) {
        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        
        if (onSuccess) {
          onSuccess(response.message);
        }
      }
    } catch (error: any) {
      setErrors({
        general: error.message || 'Failed to change password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Change Password
      </Typography>

      <Stack spacing={3}>
        {/* Error Message */}
        {errors.general && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {errors.general}
          </Alert>
        )}

        {/* Current Password */}
        <Input
          fullWidth
          type="password"
          label="Current Password"
          placeholder="Enter your current password"
          value={formData.currentPassword}
          onChange={handleInputChange('currentPassword')}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword}
          required
          disabled={isLoading || disabled}
        />

        {/* New Password */}
        <Box>
          <Input
            fullWidth
            type="password"
            label="New Password"
            placeholder="Enter your new password"
            value={formData.newPassword}
            onChange={handleInputChange('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            required
            disabled={isLoading || disabled}
          />
          <PasswordStrengthIndicator password={formData.newPassword} />
        </Box>

        {/* Confirm New Password */}
        <Input
          fullWidth
          type="password"
          label="Confirm New Password"
          placeholder="Confirm your new password"
          value={formData.confirmNewPassword}
          onChange={handleInputChange('confirmNewPassword')}
          error={!!errors.confirmNewPassword}
          helperText={errors.confirmNewPassword}
          required
          disabled={isLoading || disabled}
        />
        
        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            isLoading={isLoading}
            loadingText="Changing Password..."
            disabled={disabled || isLoading}
          >
            Change Password
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="large"
              fullWidth
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChangePasswordForm; 