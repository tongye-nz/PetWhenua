import type { SxProps, Theme } from '@mui/material';

export const buttonStyles: Record<string, SxProps<Theme>> = {
  primary: {
    backgroundColor: '#667eea',
    color: 'white',
    '&:hover': {
      backgroundColor: '#5a6fd8',
    },
    '&:disabled': {
      backgroundColor: '#ccc',
      color: '#666',
    },
  },
  secondary: {
    backgroundColor: '#764ba2',
    color: 'white',
    '&:hover': {
      backgroundColor: '#6a4190',
    },
    '&:disabled': {
      backgroundColor: '#ccc',
      color: '#666',
    },
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#667eea',
    border: '1px solid #667eea',
    '&:hover': {
      backgroundColor: '#f0f2ff',
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      color: '#ccc',
      borderColor: '#ccc',
    },
  },
  text: {
    backgroundColor: 'transparent',
    color: '#667eea',
    '&:hover': {
      backgroundColor: '#f0f2ff',
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      color: '#ccc',
    },
  },
  error: {
    backgroundColor: 'transparent',
    color: '#f44336',
    border: '1px solid #f44336',
    '&:hover': {
      backgroundColor: '#ffebee',
      borderColor: '#d32f2f',
    },
    '&:disabled': {
      backgroundColor: 'transparent',
      color: '#ccc',
      borderColor: '#ccc',
    },
  },
};
