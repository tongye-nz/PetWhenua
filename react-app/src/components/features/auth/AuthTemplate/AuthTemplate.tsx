import React from 'react';
import { Box, Paper, Stack } from '@mui/material';

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
          backgroundColor: (theme) => 
            theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Stack spacing={spacing} alignItems="center">
          {children}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AuthTemplate;
