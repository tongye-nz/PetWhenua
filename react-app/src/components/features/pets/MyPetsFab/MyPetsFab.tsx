import React from 'react';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';

export interface MyPetsFabProps {
  onAddPet: () => void;
}

const MyPetsFab: React.FC<MyPetsFabProps> = ({ onAddPet }) => {
  return (
    <Fab
      color="primary"
      aria-label="add pet"
      onClick={onAddPet}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        display: { xs: 'flex', sm: 'none' }
      }}
    >
      <Add />
    </Fab>
  );
};

export default MyPetsFab;
