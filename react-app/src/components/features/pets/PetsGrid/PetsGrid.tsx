import React from 'react';
import { Box } from '@mui/material';
import PetCard from '../PetCard';
import type { Pet } from '../../../../models/pet.types';

export interface PetsGridProps {
  pets: Pet[];
  onEditPet: (pet: Pet) => void;
  onDeletePet: (pet: Pet) => void;
  onViewPet?: (pet: Pet) => void;
}

const PetsGrid: React.FC<PetsGridProps> = ({
  pets,
  onEditPet,
  onDeletePet,
  onViewPet
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: 3
      }}
    >
      {pets.map((pet) => (
        <PetCard
          key={pet.petId}
          pet={pet}
          onEdit={onEditPet}
          onDelete={onDeletePet}
          onView={onViewPet}
          showActions={true}
        />
      ))}
    </Box>
  );
};

export default PetsGrid;
