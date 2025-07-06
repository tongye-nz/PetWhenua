import React from 'react';
import { Box } from '@mui/material';
import { Text } from '../../atoms';

export interface AuthFooterProps {
  primaryText?: string;
  linkText?: string;
  onLinkClick?: () => void;
}

const AuthFooter: React.FC<AuthFooterProps> = ({
  primaryText,
  linkText,
  onLinkClick,
}) => {
  // Don't render anything if no props provided
  if (!primaryText && !linkText) {
    return null;
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Text variant="body2" color="text.secondary">
        {primaryText}{' '}
        {linkText && onLinkClick && (
          <Text 
            component="span" 
            variant="body2"
            sx={{ 
              color: 'primary.main',
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': {
                color: 'primary.dark',
              }
            }}
            onClick={onLinkClick}
          >
            {linkText}
          </Text>
        )}
      </Text>
    </Box>
  );
};

export default AuthFooter;
