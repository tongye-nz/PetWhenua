import React from 'react';
import { Box } from '@mui/material';
import { Add, Pets } from '@mui/icons-material';
import { Text, Button } from '../../../ui';

export interface PetsEmptyStateProps {
  onAddPet: () => void;
}

const PetsEmptyState: React.FC<PetsEmptyStateProps> = ({ onAddPet }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 2
      }}
    >
      <Pets sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
      <Text variant="h5" color="text.secondary" sx={{ mb: 2 }}>
        No pets yet
      </Text>
      <Text variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Start building your pet family by adding your first furry friend!
      </Text>
      <Button
        variant="primary"
        size="large"
        startIcon={<Add />}
        onClick={onAddPet}
      >
        Add Your First Pet
      </Button>
    </Box>
  );
};

export default PetsEmptyState;
