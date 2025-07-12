import React from 'react';
import { Alert } from '@mui/material';

export interface MyPetsErrorAlertProps {
  error: string;
  onClose: () => void;
}

const MyPetsErrorAlert: React.FC<MyPetsErrorAlertProps> = ({ 
  error, 
  onClose 
}) => {
  return (
    <Alert 
      severity="error" 
      sx={{ mb: 3 }} 
      onClose={onClose}
    >
      {error}
    </Alert>
  );
};

export default MyPetsErrorAlert;
