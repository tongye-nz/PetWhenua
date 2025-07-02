import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme, muiSxStyles } from './loginStyles.tsx';
import { useAuth } from '../contexts/AuthContext';

const SignIn: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    
    try {
      await login({ usernameOrEmail, password });
      navigate('/', { replace: true });
    } catch (err) {
      // Error is handled by context
      console.error('Login failed:', err);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
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
              Sign in to PetWhenua
            </Typography>
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Welcome user, please sign in to continue
            </Typography>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            {/* Sign In Form */}
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={muiSxStyles.formBox}
            >
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Email or Username"
                  placeholder="Enter your email or username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  variant="outlined"
                  disabled={isLoading}
                />
                
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="outlined"
                  disabled={isLoading}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={muiSxStyles.submitButtonSx}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Box sx={muiSxStyles.signInLinkBox}>
                  <Typography variant="body2" color="text.secondary">
                    Not a member?{' '}
                    <Typography 
                      component="span" 
                      sx={muiSxStyles.signInLink}
                      onClick={handleRegisterClick}
                    >
                      Register now!
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

export default SignIn;
