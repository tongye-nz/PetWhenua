import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Stack
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme, muiSxStyles } from './loginStyles.tsx';

const handleSignIn = (email: string, password: string) => {
  console.log('Email:', email);
  console.log('Password:', password);
  alert(`Demo: Signing in with email: ${email}`);
};

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSignIn(email, password);
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

            {/* Sign In Form */}
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={muiSxStyles.formBox}
            >
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="outlined"
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
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={muiSxStyles.submitButtonSx}
                >
                  Sign In
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default SignIn;
