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

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onRegisterClick,
  isLoading = false,
  error = null,
  disabled = false,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ usernameOrEmail, password });
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
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          required
          disabled={isLoading || disabled}
        />
        
        <Input
          fullWidth
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          Sign In
        </Button>

        {onRegisterClick && (
          <Box sx={{ textAlign: 'center' }}>
            <Text variant="body2" color="text.secondary">
              Not a member?{' '}
              <Text 
                component="span" 
                sx={{ 
                  color: 'primary.main', 
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                    color: 'primary.dark'
                  }
                }}
                onClick={onRegisterClick}
              >
                Register now!
              </Text>
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default LoginForm;
