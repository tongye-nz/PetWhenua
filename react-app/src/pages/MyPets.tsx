import React from 'react';
import { Container } from '@mui/material';
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

const MyPets: React.FC = () => {
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <MyPetsHeader onAddPet={handleAddPet} />

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
