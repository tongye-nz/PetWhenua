import React from 'react';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { inputStyles } from './Input.styles';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'standard' | 'outlined' | 'filled';
  error?: boolean;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  variant = 'outlined',
  error = false,
  helperText,
  sx,
  ...props
}) => {
  return (
    <TextField
      variant={variant}
      error={error}
      helperText={helperText}
      sx={{
        ...inputStyles.base,
        ...(sx as any),
      }}
      {...props}
    />
  );
};

export default Input;
