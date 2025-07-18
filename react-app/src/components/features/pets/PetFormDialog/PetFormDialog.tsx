import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import PetForm from '../../../forms/PetForm';
import type { Pet, PetFormData } from '../../../../models/pet.types';

export interface PetFormDialogProps {
  open: boolean;
  editingPet: Pet | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: PetFormData) => Promise<void>;
}

const PetFormDialog: React.FC<PetFormDialogProps> = ({
  open,
  editingPet,
  isLoading,
  error,
  onClose,
  onSubmit
}) => {
  const getFormInitialData = (): Partial<PetFormData> => {
    if (!editingPet) return {};
    
    const initialData = {
      name: editingPet.name,
      species: editingPet.species || '',
      breed: editingPet.breed || '',
      // Ensure proper type conversion: number or empty string only
      birthYear: (editingPet.birthYear && typeof editingPet.birthYear === 'number') ? editingPet.birthYear : '' as number | '',
      birthMonth: (editingPet.birthMonth && typeof editingPet.birthMonth === 'number') ? editingPet.birthMonth : '' as number | '',
      gender: editingPet.gender || '',
      description: editingPet.description || '',
      profilePicture: editingPet.profilePicture || ''
    };
    
    return initialData;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {editingPet ? 'Edit Pet' : 'Add New Pet'}
      </DialogTitle>
      <DialogContent>
        <PetForm
          initialData={getFormInitialData()}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          error={error}
          submitLabel={editingPet ? 'Update Pet' : 'Add Pet'}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PetFormDialog;
