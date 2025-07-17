import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, AlertTitle } from '@mui/material';
import { AuthTemplate, AuthHeader, LoginForm, AuthFooter } from '../components';
import type { LoginFormData } from '../components';
import { useAuth } from '../contexts/AuthContext';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [attemptCount, setAttemptCount] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async (formData: LoginFormData) => {
    clearError();
    
    try {
      await login(formData);
      // Reset attempt count on successful login
      setAttemptCount(0);
      navigate('/profile', { replace: true });
    } catch (err) {
      // Increment attempt count for rate limiting guidance
      setAttemptCount(prev => prev + 1);
      console.error('Login failed:', err);
    }
  };

  const handleRegisterClick = () => {
    clearError();
    navigate('/register');
  };

  // Enhanced error message with helpful guidance
  const getEnhancedErrorMessage = () => {
    if (!error) return null;

    const isCredentialError = error.includes('Invalid username') || error.includes('password');
    const isNetworkError = error.includes('Network') || error.includes('timeout');
    const isServerError = error.includes('Server error') || error.includes('temporarily unavailable');

    if (attemptCount >= 3 && isCredentialError) {
      return (
        <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
          <AlertTitle>Multiple Failed Attempts</AlertTitle>
          Having trouble signing in? Make sure you're using the correct username/email and password. 
          If you've forgotten your password, you may need to contact support for account recovery.
        </Alert>
      );
    }

    if (isNetworkError) {
      return (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          <AlertTitle>Connection Problem</AlertTitle>
          {error} Please check your internet connection and try again.
        </Alert>
      );
    }

    if (isServerError) {
      return (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          <AlertTitle>Service Temporarily Unavailable</AlertTitle>
          {error} Please wait a moment and try again.
        </Alert>
      );
    }

    return (
      <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
        {error}
      </Alert>
    );
  };

  return (
    <AuthTemplate>
      <AuthHeader 
        title="Sign in to PetWhenua"
        subtitle="Welcome back! Please sign in to continue"
      />
      
      <Box sx={{ width: '100%' }}>
        {getEnhancedErrorMessage()}
        
        <LoginForm 
          onSubmit={handleLogin}
          onRegisterClick={handleRegisterClick}
          isLoading={isLoading}
          error={null} // We handle the error display above
        />
      </Box>
      
      <AuthFooter />
    </AuthTemplate>
  );
};

export default SignIn;
