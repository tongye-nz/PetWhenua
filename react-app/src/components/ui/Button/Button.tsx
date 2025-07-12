import React from 'react';
import { Button as MuiButton } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';
import { buttonStyles } from './Button.styles';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'error';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  disabled,
  sx,
  ...props
}) => {
  const muiVariant = variant === 'primary' ? 'contained' : 
                     variant === 'secondary' ? 'contained' : 
                     variant === 'outline' ? 'outlined' :
                     variant === 'error' ? 'outlined' : 'text';

  const buttonStyle = buttonStyles[variant] || buttonStyles.primary;

  return (
    <MuiButton
      variant={muiVariant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      sx={{
        ...buttonStyle,
        ...(sx as any),
      }}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </MuiButton>
  );
};

export default Button;
