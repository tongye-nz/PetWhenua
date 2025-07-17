import React from 'react';
import { Button as MuiButton, CircularProgress, Box } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';
import { buttonStyles } from './Button.styles';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'error';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
  loadingText?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  disabled,
  loadingText,
  sx,
  ...props
}) => {
  const muiVariant = variant === 'primary' ? 'contained' : 
                     variant === 'secondary' ? 'contained' : 
                     variant === 'outline' ? 'outlined' :
                     variant === 'error' ? 'outlined' : 'text';

  const buttonStyle = buttonStyles[variant] || buttonStyles.primary;

  // Determine spinner size based on button size
  const spinnerSize = size === 'small' ? 16 : size === 'large' ? 20 : 18;

  const getSpinnerColor = () => {
    if (variant === 'primary' || variant === 'secondary') {
      return 'inherit'; // White spinner on colored background
    }
    return 'primary'; // Primary color spinner on light background
  };

  // Render loading content if loading, otherwise render children
  const content = isLoading ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <CircularProgress
        size={spinnerSize}
        color={getSpinnerColor()}
        thickness={4}
      />
      {loadingText && (
        <Box component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
          {loadingText}
        </Box>
      )}
    </Box>
  ) : (
    children
  );

  return (
    <MuiButton
      variant={muiVariant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      sx={{
        ...buttonStyle,
        // Ensure consistent minimum height to prevent layout shift
        minHeight: size === 'large' ? 42 : size === 'small' ? 30 : 36,
        ...(sx as any),
      }}
      {...props}
    >
      {content}
    </MuiButton>
  );
};

export default Button;
