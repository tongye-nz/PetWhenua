import React from 'react';
import { Container } from '@mui/material';
import { LoadingSpinner } from '../../../ui';

export interface MyPetsLoadingProps {
  minHeight?: string | number;
}

const MyPetsLoading: React.FC<MyPetsLoadingProps> = ({ 
  minHeight = "400px" 
}) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <LoadingSpinner 
        size="large"
        centered
        containerProps={{ minHeight }}
      />
    </Container>
  );
};

export default MyPetsLoading;
