import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { petService } from '../api/pet.api';
import type { Pet, PetFormData } from '../models/pet.types';
import { calculateAgeInYears } from '../models/pet.types';
import { handlePetProfilePictureUpload } from '../utils/petProfileUpload';

export const useMyPets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user's pets
  const loadPets = async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const userPets = await petService.getUserPets(user.userId);
      setPets(userPets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [user?.userId]);

  // Handle create/edit pet
  const handleSavePet = async (formData: PetFormData, processedImageFile?: File | null) => {
    if (!user?.userId) return;

    try {
      setFormLoading(true);
      setFormError(null);
      setSuccess(null); // Clear any previous success message

      const petData = {
        ...formData,
        userId: user.userId,
        // Calculate age from birth year for backend compatibility
        age: formData.birthYear !== '' ? calculateAgeInYears(formData.birthYear as number) : 0,
        // Ensure birth year and month are numbers or undefined
        birthYear: formData.birthYear !== '' ? formData.birthYear as number : undefined,
        birthMonth: formData.birthMonth !== '' ? formData.birthMonth as number : undefined
      };

      let petId: number;
      
      if (editingPet) {
        // Update existing pet
        await petService.updatePet(editingPet.petId!, {
          ...petData,
          petId: editingPet.petId!
        });
        petId = editingPet.petId!;
        setSuccess('Pet Profile updated successfully!');
      } else {
        // Create new pet
        const createdPet = await petService.createPet(petData);
        petId = createdPet.petId!;
        setSuccess('Pet created successfully!');
      }

      // Upload profile picture if provided
      if (processedImageFile) {
        try {
          const profilePictureUrl = await handlePetProfilePictureUpload(petId, processedImageFile);
          if (profilePictureUrl) {
            console.log(`Profile picture uploaded for pet ${petId}: ${profilePictureUrl}`);
          }
        } catch (error) {
          console.error('Failed to upload pet profile picture:', error);
          // Don't fail the whole operation if profile picture upload fails
        }
      }

      // Reload pets and close form
      await loadPets();
      setFormOpen(false);
      setEditingPet(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save pet');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit pet
  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setFormOpen(true);
  };

  // Handle delete pet
  const handleDeletePet = (pet: Pet) => {
    setPetToDelete(pet);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePet = async () => {
    if (!petToDelete?.petId) return;

    try {
      setLoading(true);
      await petService.deletePet(petToDelete.petId);
      await loadPets();
      setDeleteDialogOpen(false);
      setPetToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pet');
    } finally {
      setLoading(false);
    }
  };

  // Handle add new pet
  const handleAddPet = () => {
    setEditingPet(null);
    setFormError(null);
    setFormOpen(true);
  };

  // Handle close form
  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingPet(null);
    setFormError(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPetToDelete(null);
  };

  return {
    // State
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
    
    // Actions
    handleAddPet,
    handleEditPet,
    handleDeletePet,
    handleSavePet,
    handleCloseForm,
    handleCloseDeleteDialog,
    confirmDeletePet,
    setError
  };
};
