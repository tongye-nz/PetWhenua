import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Stack,
  Alert
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme, muiSxStyles } from './registerStyles';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const handleRegister = (formData: FormData) => {
  console.log('Registration data:', formData);
  alert(`Demo: Registering user ${formData.username} with email: ${formData.email}`);
};

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      handleRegister(formData);
      setShowSuccess(true);
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setShowSuccess(false);
      }, 3000);
    }
  };

  const handleInputChange = (field: keyof FormData) => (
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

  const handleSignInClick = () => {
    navigate('/login');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={muiSxStyles.backgroundBox}>
        <Paper elevation={10} sx={muiSxStyles.paper}>
          <Stack spacing={2} alignItems="center">
            {/* Logo and Title */}
            <Box sx={muiSxStyles.logoBox}>
              <img
                src="/logo.png"
                alt="PetWhenua"
                style={{ height: 60 }}
              />
            </Box>
            
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Create Your Account
            </Typography>
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Join PetWhenua and connect with pet lovers in your community
            </Typography>

            {/* Success Message */}
            {showSuccess && (
              <Alert severity="success" sx={{ width: '100%' }}>
                Account created successfully! Welcome to PetWhenua!
              </Alert>
            )}

            {/* Registration Form */}
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={muiSxStyles.formBox}
            >
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  error={!!errors.username}
                  helperText={errors.username}
                  required
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  variant="outlined"
                />
                
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  type="password"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  required
                  variant="outlined"
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={muiSxStyles.submitButtonSx}
                >
                  Create Account
                </Button>

                <Box sx={muiSxStyles.signInLinkBox}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Typography 
                      component="span" 
                      sx={muiSxStyles.signInLink}
                      onClick={handleSignInClick}
                    >
                      Sign In
                    </Typography>
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Register;
