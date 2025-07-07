import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthTemplate, AuthHeader, LoginForm, AuthFooter } from '../components';
import type { LoginFormData } from '../components';
import { useAuth } from '../contexts/AuthContext';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (formData: LoginFormData) => {
    clearError();
    
    try {
      await login(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Error is handled by context
      console.error('Login failed:', err);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <AuthTemplate>
      <AuthHeader 
        title="Sign in to PetWhenua"
        subtitle="Welcome user, please sign in to continue"
      />
      
      <LoginForm 
        onSubmit={handleLogin}
        onRegisterClick={handleRegisterClick}
        isLoading={isLoading}
        error={error}
      />
      
      <AuthFooter />
    </AuthTemplate>
  );
};

export default SignIn;
