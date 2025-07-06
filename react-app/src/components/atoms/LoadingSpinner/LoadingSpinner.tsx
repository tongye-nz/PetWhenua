import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import type { CircularProgressProps, BoxProps } from '@mui/material';

export interface LoadingSpinnerProps extends CircularProgressProps {
  size?: 'small' | 'medium' | 'large';
  centered?: boolean;
  containerProps?: BoxProps;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  centered = false,
  containerProps,
  ...props
}) => {
  const spinnerSizes = {
    small: 20,
    medium: 40,
    large: 60,
  };

  const spinner = (
    <CircularProgress
      size={spinnerSizes[size]}
      {...props}
    />
  );

  if (centered) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100px"
        {...containerProps}
      >
        {spinner}
      </Box>
    );
  }

  return spinner;
};

export default LoadingSpinner;
