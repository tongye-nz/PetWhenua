import React from 'react';
import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';

export interface LogoProps extends BoxProps {
  size?: 'small' | 'medium' | 'large';
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  alt = 'PetWhenua',
  sx,
  ...props
}) => {
  const logoSizes = {
    small: { height: 32 },
    medium: { height: 48 },
    large: { height: 64 },
  };

  return (
    <Box
      component="img"
      src="/logo.png"
      alt={alt}
      sx={{
        ...logoSizes[size],
        objectFit: 'contain',
        ...sx,
      }}
      {...props}
    />
  );
};

export default Logo;
