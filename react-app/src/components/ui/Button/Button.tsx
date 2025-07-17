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
  const spinnerSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  const getSpinnerColor = () => {
    if (variant === 'primary' || variant === 'secondary') {
      return 'inherit'; // White spinner on colored background
    }
    return 'primary'; // Primary color spinner on light background
  };

  return (
    <MuiButton
      variant={muiVariant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      sx={{
        ...buttonStyle,
        position: 'relative',
        ...(sx as any),
      }}
      {...props}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CircularProgress
            size={spinnerSize}
            color={getSpinnerColor()}
            thickness={4}
          />
          {loadingText && (
            <span style={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
              {loadingText}
            </span>
          )}
        </Box>
      )}
      <Box sx={{ visibility: isLoading ? 'hidden' : 'visible' }}>
        {children}
      </Box>
    </MuiButton>
  );
};

export default Button;
