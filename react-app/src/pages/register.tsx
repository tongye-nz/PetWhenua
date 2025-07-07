import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthTemplate, AuthHeader, RegisterForm, AuthFooter } from '../components';
import type { RegisterFormData } from '../components';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (formData: RegisterFormData) => {
    clearError();
    
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Error is handled by context
      console.error('Registration failed:', err);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <AuthTemplate>
      <AuthHeader 
        title="Create Your Account"
        subtitle="Join PetWhenua and connect with pet lovers in your community"
      />
      
      <RegisterForm 
        onSubmit={handleRegister}
        onLoginClick={handleLoginClick}
        isLoading={isLoading}
        error={error}
      />
      
      <AuthFooter />
    </AuthTemplate>
  );
};

export default Register;
