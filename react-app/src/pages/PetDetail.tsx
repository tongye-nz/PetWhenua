import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Alert
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Button, LoadingSpinner } from '../components/ui';
import { 
  PetFormDialog, 
  PetSelectionDialog,
  PetProfileHeader,
  PetProfileOwnerView,
  PetProfilePublicView,
  PetConnectionsSection
} from '../components/features/pets';
import { useAuth } from '../contexts/AuthContext';
import { petService } from '../api/pet.api';
import { petConnectionService } from '../api/petConnection.api';
import type { Pet, PetFormData } from '../models/pet.types';
import type { PetConnectionStatus } from '../models/petConnection.types';
import { calculateAgeInYears } from '../models/pet.types';

const PetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state for editing
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pet connection state
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<PetConnectionStatus | null>(null);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [connectedPets, setConnectedPets] = useState<Pet[]>([]);
  const [loadingConnectedPets, setLoadingConnectedPets] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) {
        setError('Pet ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const petData = await petService.getPetById(parseInt(id), true); // Include user data
        setPet(petData);
        
        // Fetch connected pets for this pet
        if (petData.petId) {
          await fetchConnectedPets(petData.petId);
        }
        
        // Check connection status if this is not the user's own pet
        if (user && petData.userId !== user.userId) {
          await checkConnectionStatus(petData);
        }
      } catch (err) {
        console.error('Failed to fetch pet:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pet details');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const checkConnectionStatus = async (targetPet: Pet) => {
    if (!user?.userId || !targetPet.petId) return;
    
    try {
      setLoadingConnection(true);
      
      // Get current user's pets
      const userPets = await petService.getCurrentUserPets();
      
      if (userPets.length === 0) {
        setConnectionStatus(null);
        return;
      }
      
      // Check connection status between user's pets and target pet
      let overallStatus: PetConnectionStatus | null = null;
      
      for (const userPet of userPets) {
        if (userPet.petId) {
          try {
            const statusResponse = await petConnectionService.getConnectionStatus(
              userPet.petId, 
              targetPet.petId
            );
            
            // Priority: Accepted > Pending > null
            if (statusResponse.status === 'Accepted') {
              overallStatus = 'Accepted';
              break; // Accepted is highest priority, stop checking
            } else if (statusResponse.status === 'Pending' && overallStatus !== 'Accepted') {
              overallStatus = 'Pending';
            }
          } catch (error) {
            // If no connection exists between these pets, continue checking others
            console.log(`No connection between pet ${userPet.petId} and ${targetPet.petId}`);
          }
        }
      }
      
      setConnectionStatus(overallStatus);
      console.log('Connection status check result:', overallStatus);
    } catch (error) {
      console.error('Failed to check connection status:', error);
      setConnectionStatus(null);
    } finally {
      setLoadingConnection(false);
    }
  };

  const fetchConnectedPets = async (petId: number) => {
    try {
      setLoadingConnectedPets(true);
      const connected = await petConnectionService.getConnectedPets(petId);
      setConnectedPets(connected);
    } catch (error) {
      console.error('Failed to fetch connected pets:', error);
      setConnectedPets([]);
    } finally {
      setLoadingConnectedPets(false);
    }
  };

  const handleConnectClick = () => {
    setConnectDialogOpen(true);
  };

  const handleConnectionRequested = async () => {
    setSuccess('Connection request sent! Wait for the pet owner to respond.');
    setConnectionStatus('Pending');
    
    // Refresh both connected pets and connection status
    if (pet?.petId) {
      await fetchConnectedPets(pet.petId);
      await checkConnectionStatus(pet);
    }
  };

  const handleEdit = () => {
    setEditingPet(pet);
    setEditFormOpen(true);
  };

  const handleEditSubmit = async (formData: PetFormData) => {
    if (!editingPet?.petId || !user?.userId) {
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);
      setSuccess(null); // Clear any previous success message

      // Convert form data to match backend format (same as useMyPets)
      const petData = {
        ...formData,
        userId: user.userId,
        // Calculate age from birth year for backend compatibility
        age: formData.birthYear !== '' ? calculateAgeInYears(formData.birthYear as number) : 0,
        // Ensure birth year and month are numbers or undefined - handle empty strings
        birthYear: formData.birthYear !== '' ? formData.birthYear as number : undefined,
        birthMonth: formData.birthMonth !== '' ? formData.birthMonth as number : undefined
      };

      // Update the pet
      await petService.updatePet(editingPet.petId, {
        ...petData,
        petId: editingPet.petId
      });
      
      // Close modal first
      setEditFormOpen(false);
      setEditingPet(null);
      
      // Set success message
      setSuccess('Pet Profile updated successfully!');
      
      // Add a small delay to ensure the backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then refetch the pet details to get the latest data
      const updatedPet = await petService.getPetById(editingPet.petId, true);
      setPet(updatedPet);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error('Failed to update pet:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to update pet');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditFormOpen(false);
    setEditingPet(null);
  };

  const handlePetClick = (petId: number) => {
    navigate(`/pet/${petId}`);
  };

  const isOwnPet = user?.userId === pet?.userId;

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!pet) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Pet not found
        </Alert>
        <Button 
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Pet Profile Header */}
      <PetProfileHeader
        pet={pet}
        isOwnPet={isOwnPet}
        connectionStatus={connectionStatus}
        loadingConnection={loadingConnection}
        onBack={handleBack}
        onEdit={handleEdit}
        onConnect={handleConnectClick}
      />

      {/* Conditional Layout based on ownership */}
      {isOwnPet ? (
        <PetProfileOwnerView pet={pet} />
      ) : (
        <PetProfilePublicView
          pet={pet}
          connectionStatus={connectionStatus}
          loadingConnection={loadingConnection}
          onConnect={handleConnectClick}
        />
      )}

      {/* Social Connections Section */}
      <PetConnectionsSection
        pet={pet}
        isOwnPet={isOwnPet}
        connectedPets={connectedPets}
        loadingConnectedPets={loadingConnectedPets}
        onPetClick={handlePetClick}
      />

      {/* Edit Pet Modal */}
      <PetFormDialog
        open={editFormOpen}
        editingPet={editingPet}
        onSubmit={handleEditSubmit}
        onClose={handleEditCancel}
        isLoading={formLoading}
        error={formError}
      />

      {/* Pet Connection Dialog */}
      {pet && !isOwnPet && (
        <PetSelectionDialog
          open={connectDialogOpen}
          targetPet={pet}
          onClose={() => setConnectDialogOpen(false)}
          onConnectionRequested={handleConnectionRequested}
        />
      )}
    </Container>
  );
};

export default PetDetail;
