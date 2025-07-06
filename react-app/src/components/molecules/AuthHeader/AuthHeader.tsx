import React from 'react';
import { Box, Stack } from '@mui/material';
import { Logo, Text } from '../../atoms';

export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  logoSize?: 'small' | 'medium' | 'large';
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  logoSize = 'large',
}) => {
  return (
    <Stack spacing={2} alignItems="center">
      {/* Logo */}
      <Box>
        <Logo size={logoSize} />
      </Box>
      
      {/* Title */}
      <Text variant="h5" weight="bold" align="center">
        {title}
      </Text>
      
      {/* Subtitle */}
      {subtitle && (
        <Text variant="body2" color="text.secondary" align="center">
          {subtitle}
        </Text>
      )}
    </Stack>
  );
};

export default AuthHeader;
