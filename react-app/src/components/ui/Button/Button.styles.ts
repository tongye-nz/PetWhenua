import type { SxProps, Theme } from '@mui/material';

export const buttonStyles: Record<string, SxProps<Theme>> = {
  primary: {
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    '&:disabled': {
      backgroundColor: 'action.disabledBackground',
      color: 'action.disabled',
    },
  },
  secondary: {
    backgroundColor: 'secondary.main',
    color: 'secondary.contrastText',
    '&:hover': {
      backgroundColor: 'secondary.dark',
    },
    '&:disabled': {
      backgroundColor: 'action.disabledBackground',
      color: 'action.disabled',
    },
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'primary.main',
    border: '1px solid',
    borderColor: 'primary.main',
    '&:hover': {
      backgroundColor: (theme: Theme) => 
        theme.palette.mode === 'light' ? 'primary.light' : 'primary.dark',
      opacity: 0.1,
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      color: 'action.disabled',
      borderColor: 'action.disabled',
    },
  },
  text: {
    backgroundColor: 'transparent',
    color: 'primary.main',
    '&:hover': {
      backgroundColor: (theme: Theme) => 
        theme.palette.mode === 'light' ? 'primary.light' : 'primary.dark',
      opacity: 0.1,
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      color: 'action.disabled',
    },
  },
  error: {
    backgroundColor: 'transparent',
    color: 'error.main',
    border: '1px solid',
    borderColor: 'error.main',
    '&:hover': {
      backgroundColor: 'error.light',
      opacity: 0.1,
      borderColor: 'error.dark',
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      color: 'action.disabled',
      borderColor: 'action.disabled',
    },
  },
};
