import type { SxProps, Theme } from '@mui/material';

export const inputStyles: Record<string, SxProps<Theme>> = {
  base: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#e0e0e0',
      },
      '&:hover fieldset': {
        borderColor: '#667eea',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#667eea',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#666',
      '&.Mui-focused': {
        color: '#667eea',
      },
    },
  },
};
