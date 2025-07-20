import type { SxProps, Theme } from '@mui/material';

export const inputStyles: Record<string, SxProps<Theme>> = {
  base: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'divider',
      },
      '&:hover fieldset': {
        borderColor: 'primary.main',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'text.secondary',
      '&.Mui-focused': {
        color: 'primary.main',
      },
    },
  },
};
