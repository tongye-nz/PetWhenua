import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, AlertTitle } from '@mui/material';
import { AuthTemplate, AuthHeader, RegisterForm, AuthFooter } from '../components';
import type { RegisterFormData } from '../components';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

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

  const handleRegister = async (formData: RegisterFormData) => {
    clearError();
    
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/profile', { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleLoginClick = () => {
    clearError();
    navigate('/login');
  };

  // Enhanced error message with helpful guidance
  const getEnhancedErrorMessage = () => {
    if (!error) return null;

    const isValidationError = error.includes('validation') || error.includes('already exists') || error.includes('required');
    const isNetworkError = error.includes('Network') || error.includes('timeout');
    const isServerError = error.includes('Server error') || error.includes('temporarily unavailable');

    if (isValidationError) {
      return (
        <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
          <AlertTitle>Registration Error</AlertTitle>
          {error} Please check your information and try again. Make sure your username and email are unique.
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
        title="Create Your Account"
        subtitle="Join PetWhenua and connect with pet lovers in your community"
      />
      
      <Box sx={{ width: '100%' }}>
        {getEnhancedErrorMessage()}
        
        <RegisterForm 
          onSubmit={handleRegister}
          onLoginClick={handleLoginClick}
          isLoading={isLoading}
          error={null} // We handle the error display above
        />
      </Box>
      
      <AuthFooter />
    </AuthTemplate>
  );
};

export default Register;
