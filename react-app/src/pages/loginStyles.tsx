import type { CSSProperties } from 'react';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
});

export const loginStyles: { [key: string]: CSSProperties } = {
  backgroundContainer: {
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/homepage.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  paperContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  logoImage: {
    height: '32px',
  },
  formContainer: {
    width: '100%',
    marginTop: '16px',
  },
  submitButton: {
    marginTop: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
  },
};

export const muiSxStyles = {
  backgroundBox: {
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/homepage.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  paper: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: 2,
    padding: 3,
    maxWidth: 400,
    width: '100%',
  },
  logoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1,
  },
  formBox: {
    width: '100%',
    mt: 2,
  },
  submitButtonSx: {
    mt: 2,
    py: 1.5,
  },
  signInLinkBox: {
    mt: 2,
    textAlign: 'center',
  },
  signInLink: {
    color: 'primary.main',
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:hover': {
      color: 'primary.dark',
    },
  },
};
