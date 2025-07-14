import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Box,
  Avatar,
  Chip,
  Alert,
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import { 
  ArrowBack, 
  Edit,
  Cake,
  Pets,
  Male,
  Female,
  Info,
  Person
} from '@mui/icons-material';
import { Button, Text, LoadingSpinner } from '../components/ui';
import { PetConnectionButton } from '../components/ui';
import { PetFormDialog } from '../components/features/pets';
import { useAuth } from '../contexts/AuthContext';
import { petService } from '../api/pet.api';
import type { Pet, PetFormData } from '../models/pet.types';
import { formatPetAge, calculateAgeInYears } from '../models/pet.types';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAgeDisplay = () => {
    if (!pet) return '';
    
    if (pet.birthYear) {
      return formatPetAge(pet.birthYear, pet.birthMonth);
    } else if (pet.age !== undefined) {
      if (pet.age === 0) {
        return 'Under 1 year old';
      } else if (pet.age === 1) {
        return '1 year old';
      } else {
        return `${pet.age} years old`;
      }
    }
    return 'Age unknown';
  };

  const getGenderIcon = () => {
    if (!pet?.gender) return null;
    
    const gender = pet.gender.toLowerCase();
    if (gender === 'male' || gender === 'm') {
      return <Male sx={{ color: '#2196f3', fontSize: 20 }} />;
    } else if (gender === 'female' || gender === 'f') {
      return <Female sx={{ color: '#e91e63', fontSize: 20 }} />;
    }
    return null;
  };

  const isOwnPet = user?.userId === pet?.userId;
  const userPetIds = user ? [] : []; // TODO: Get current user's pet IDs for connection button

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box py={4}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  if (!pet) {
    return (
      <Container>
        <Box py={4}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Pet not found
          </Alert>
          <Button 
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Go Back
          </Button>
        </Box>
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

      {/* Header with back button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBack} sx={{ p: 1 }}>
          <ArrowBack />
        </IconButton>
        <Text variant="h4" component="h1">
          {pet.name}
        </Text>
        {isOwnPet && (
          <Button
            variant="outline"
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{ ml: 'auto' }}
          >
            Edit Pet
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Main Pet Info Card */}
        <Box sx={{ flex: { xs: 1, md: 2 } }}>
          <Card sx={{ mb: 3 }}>
            {/* Pet Image */}
            {pet.profilePicture && (
              <CardMedia
                component="img"
                height="400"
                image={pet.profilePicture}
                alt={pet.name}
                sx={{ objectFit: 'cover' }}
              />
            )}
            
            <CardContent>
              {/* Pet Name and Basic Info */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Text variant="h3" component="h1">
                    {pet.name}
                  </Text>
                  {getGenderIcon()}
                </Box>
                
                {/* Species and Breed */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {pet.species && (
                    <Chip 
                      icon={<Pets />}
                      label={pet.species}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {pet.breed && (
                    <Chip 
                      label={pet.breed}
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  {pet.age !== undefined && (
                    <Chip 
                      icon={<Cake />}
                      label={getAgeDisplay()}
                      color="info"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>

              {/* Description */}
              {pet.description && (
                <Box sx={{ mb: 3 }}>
                  <Text variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info />
                    About {pet.name}
                  </Text>
                  <Text variant="body1" sx={{ lineHeight: 1.6 }}>
                    {pet.description}
                  </Text>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Owner Information */}
              {pet.user && (
                <Box>
                  <Text variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person />
                    Pet Owner
                  </Text>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 48, height: 48 }}>
                      {pet.user.firstName?.[0] || pet.user.username[0]}
                    </Avatar>
                    <Box>
                      <Text variant="body1" sx={{ fontWeight: 600 }}>
                        {pet.user.firstName || pet.user.username}
                      </Text>
                      <Text variant="body2" color="text.secondary">
                        Pet owner since {pet.createdAt ? formatDate(pet.createdAt) : 'Unknown'}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: 1 }}>
          {/* Pet Stats */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Text variant="h6" sx={{ mb: 2 }}>
              Pet Details
            </Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text variant="body2" color="text.secondary">Species:</Text>
                <Text variant="body2">{pet.species || 'Not specified'}</Text>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text variant="body2" color="text.secondary">Breed:</Text>
                <Text variant="body2">{pet.breed || 'Not specified'}</Text>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text variant="body2" color="text.secondary">Age:</Text>
                <Text variant="body2">{getAgeDisplay()}</Text>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text variant="body2" color="text.secondary">Gender:</Text>
                <Text variant="body2">{pet.gender || 'Not specified'}</Text>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text variant="body2" color="text.secondary">Registered:</Text>
                <Text variant="body2">
                  {pet.createdAt ? formatDate(pet.createdAt) : 'Unknown'}
                </Text>
              </Box>
            </Box>
          </Paper>

          {/* Pet Connection */}
          {!isOwnPet && user && userPetIds.length > 0 && pet.petId && (
            <Paper sx={{ p: 3 }}>
              <Text variant="h6" sx={{ mb: 2 }}>
                Connect Pets
              </Text>
              <Text variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Connect your pet with {pet.name} to enable interactions and potential playdates.
              </Text>
              <PetConnectionButton
                myPetId={userPetIds[0]} // Use first pet for now
                targetPetId={pet.petId}
                size="medium"
                variant="contained"
              />
            </Paper>
          )}
        </Box>
      </Box>

      {/* Edit Pet Modal */}
      <PetFormDialog
        open={editFormOpen}
        editingPet={editingPet}
        onSubmit={handleEditSubmit}
        onClose={handleEditCancel}
        isLoading={formLoading}
        error={formError}
      />
    </Container>
  );
};

export default PetDetail;
