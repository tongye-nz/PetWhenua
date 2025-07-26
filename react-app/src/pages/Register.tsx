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
  }, []);

  const handleRegister = async (formData: RegisterFormData) => {
    clearError();
    
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/profile', { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
      // Error is already handled in AuthContext
    }
  };

  const handleLoginClick = () => {
    clearError();
    navigate('/login');
  };

  // Error display
  const renderErrorAlert = () => {
    if (!error) return null;

    const errorLower = error.toLowerCase();
    const isUsernameError = errorLower.includes('username already exists') || 
                           (errorLower.includes('username') && errorLower.includes('exists'));
    const isEmailError = errorLower.includes('email already exists') || 
                        (errorLower.includes('email') && errorLower.includes('exists'));

    if (isUsernameError) {
      return (
        <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
          <AlertTitle>Username Already Taken</AlertTitle>
          This username is already taken. Please choose a different username.
          <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
            <li>Usernames must be unique</li>
            <li>Only letters, numbers, hyphens, and underscores are allowed</li>
            <li>Length must be between 3 and 20 characters</li>
          </Box>
        </Alert>
      );
    }

    if (isEmailError) {
      return (
        <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
          <AlertTitle>Email Already Registered</AlertTitle>
          This email is already registered. Please use a different email or try logging in.
          <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
            <li>Please use a different email address</li>
            <li>If this is your email, try logging in instead</li>
          </Box>
        </Alert>
      );
    }

    // For any other error
    return (
      <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
        <AlertTitle>Registration Failed</AlertTitle>
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
        {renderErrorAlert()}
        
        <RegisterForm 
          onSubmit={handleRegister}
          onLoginClick={handleLoginClick}
          isLoading={isLoading}
          error={null}
        />
      </Box>
      
      <AuthFooter />
    </AuthTemplate>
  );
};

export default Register;
