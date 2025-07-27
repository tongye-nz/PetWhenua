import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Alert } from '@mui/material';
import {
  MyPetsHeader,
  PetsEmptyState,
  PetsGrid,
  PetFormDialog,
  PetDeleteDialog,
  MyPetsLoading,
  MyPetsErrorAlert,
  MyPetsFab
} from '../components/features/pets';
import { useMyPets } from '../hooks/useMyPets';
import type { Pet } from '../models/pet.types';

const MyPets: React.FC = () => {
  const navigate = useNavigate();
  const {
    pets,
    loading,
    error,
    formOpen,
    editingPet,
    deleteDialogOpen,
    petToDelete,
    formLoading,
    formError,
    success,
    handleAddPet,
    handleEditPet,
    handleDeletePet,
    handleSavePet,
    handleCloseForm,
    handleCloseDeleteDialog,
    confirmDeletePet,
    setError
  } = useMyPets();

  if (loading && pets.length === 0) {
    return <MyPetsLoading />;
  }

  const handleViewPet = (pet: Pet) => {
    if (pet.petId) {
      navigate(`/pet/${pet.petId}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <MyPetsHeader onAddPet={handleAddPet} />

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <MyPetsErrorAlert error={error} onClose={() => setError(null)} />
      )}

      {pets.length === 0 && !loading ? (
        <PetsEmptyState onAddPet={handleAddPet} />
      ) : (
        <PetsGrid
          pets={pets}
          onEditPet={handleEditPet}
          onDeletePet={handleDeletePet}
          onViewPet={handleViewPet}
        />
      )}

      <MyPetsFab onAddPet={handleAddPet} />

      <PetFormDialog
        open={formOpen}
        editingPet={editingPet}
        isLoading={formLoading}
        error={formError}
        onClose={handleCloseForm}
        onSubmit={handleSavePet}
      />

      <PetDeleteDialog
        open={deleteDialogOpen}
        pet={petToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDeletePet}
      />
    </Container>
  );
};

export default MyPets;
