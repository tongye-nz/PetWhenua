import React from 'react';
import { Typography } from '@mui/material';
import type { TypographyProps } from '@mui/material';

export interface TextProps extends TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'text.primary' | 'text.secondary';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'light' | 'regular' | 'medium' | 'bold';
}

const Text: React.FC<TextProps> = ({
  children,
  variant = 'body1',
  color = 'text.primary',
  align = 'left',
  weight = 'regular',
  sx,
  ...props
}) => {
  const fontWeight = {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
  }[weight];

  return (
    <Typography
      variant={variant}
      color={color}
      align={align}
      sx={{
        fontWeight,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default Text;
