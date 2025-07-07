import React from 'react';
import { Box, Paper, Stack } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './AuthTemplate.styles';

export interface AuthTemplateProps {
  children: React.ReactNode;
  maxWidth?: number;
  spacing?: number;
}

const AuthTemplate: React.FC<AuthTemplateProps> = ({
  children,
  maxWidth = 400,
  spacing = 2,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/homepage.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 3,
            maxWidth,
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack spacing={spacing} alignItems="center">
            {children}
          </Stack>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default AuthTemplate;
