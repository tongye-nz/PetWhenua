import React from 'react';
import { Box } from '@mui/material';
import { Add, Pets } from '@mui/icons-material';
import { Text, Button } from '../../../ui';

export interface MyPetsHeaderProps {
  onAddPet: () => void;
}

const MyPetsHeader: React.FC<MyPetsHeaderProps> = ({ onAddPet }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
      <Pets sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
      <Text variant="h3" component="h1" sx={{ flexGrow: 1 }}>
        My Pets
      </Text>
      <Button
        variant="primary"
        startIcon={<Add />}
        onClick={onAddPet}
        sx={{ display: { xs: 'none', sm: 'flex' } }}
      >
        Add Pet
      </Button>
    </Box>
  );
};

export default MyPetsHeader;
