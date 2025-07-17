import React, { useState, useEffect } from 'react';
import { Container, Box, Paper, Typography, Alert } from '@mui/material';
import { Pets as PetsIcon, LocationOn } from '@mui/icons-material';
import { Text, LoadingSpinner } from '../components/ui';
import { PetCard } from '../components/features/pets';
import { petService } from '../api/pet.api';
import { userAPI } from '../api/user.api';
import { useAuth } from '../contexts/AuthContext';
import type { Pet } from '../models/pet.types';
import type { User } from '../models/auth.types';

interface PetWithOwner extends Pet {
  ownerLocation?: string;
}

const PetsNearMe: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [pets, setPets] = useState<PetWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load pets and filter by owner's location
  const loadPetsNearMe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all pets and all users to match locations
      const [allPets, allUsers] = await Promise.all([
        petService.getPets({ includeUser: true }),
        userAPI.getAllUsers()
      ]);
      
      // Create a user lookup map for location data
      const userLocationMap = new Map<number, string>();
      allUsers.forEach((user: User) => {
        if (user.location) {
          userLocationMap.set(user.userId, user.location);
        }
      });
      
      // Filter pets by owner's location if current user has location
      let filteredPets = allPets
        .filter(pet => pet.user && pet.user.userId !== currentUser?.userId)
        .map(pet => ({
          ...pet,
          ownerLocation: userLocationMap.get(pet.userId)
        }));
      
      if (currentUser?.location) {
        // Extract region and district from current user's location
        const locationParts = currentUser.location.split(',').map((part: string) => part.trim());
        const currentRegion = locationParts[0]?.toLowerCase();
        const currentDistrict = locationParts[1]?.toLowerCase();
        
        filteredPets = filteredPets.filter(pet => {
          if (!pet.ownerLocation) return false;
          
          const petOwnerLocationParts = pet.ownerLocation.split(',').map((part: string) => part.trim());
          const petOwnerRegion = petOwnerLocationParts[0]?.toLowerCase();
          const petOwnerDistrict = petOwnerLocationParts[1]?.toLowerCase();
          
          // Match both region and district for more precise location matching
          return petOwnerRegion === currentRegion && petOwnerDistrict === currentDistrict;
        });
      }
      
      setPets(filteredPets);
    } catch (err) {
      console.error('Failed to load pets:', err);
      setError('Failed to load pets near you');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadPetsNearMe();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 4 }}>
          You must be logged in to find pets near you.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <PetsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Text variant="h4" component="h1">
            Pets Near You
          </Text>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Text variant="body1" color="text.secondary">
            {currentUser.location || 'No location set'} 
          </Text>
        </Box>
        <Text variant="body1" color="text.secondary">
          Discover adorable pets in your area and connect with their owners
        </Text>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner />
        </Box>
      )}

      {/* No location warning */}
      {!loading && !currentUser.location && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'warning.50' }}>
          <Typography variant="h6" color="warning.main" sx={{ mb: 1 }}>
            Add Your Location
          </Typography>
          <Typography variant="body2" color="text.secondary">
            To find pets near you, please add your location in your profile settings.
          </Typography>
        </Paper>
      )}

      {/* Empty State */}
      {!loading && pets.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
          <PetsIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Text variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            {currentUser.location 
              ? 'No pets found in your area' 
              : 'No pets found'
            }
          </Text>
          <Text variant="body1" color="text.secondary">
            {currentUser.location 
              ? 'Check back later for new pet profiles in your area.'
              : 'Set your location to find pets near you.'
            }
          </Text>
        </Box>
      )}

      {/* Pets Grid */}
      {!loading && pets.length > 0 && (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Found {pets.length} pet{pets.length !== 1 ? 's' : ''} near you
            </Typography>
          </Paper>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 3
          }}>
                         {pets.map((pet) => (
               <PetCard
                 key={pet.petId}
                 pet={pet}
                 compact={false}
               />
             ))}
          </Box>
        </>
      )}

      {/* Info Box */}
      {!loading && pets.length > 0 && (
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'primary.50' }}>
          <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
            Connect with Pet Owners
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click on any pet to view their profile and connect with their owner. 
            Build friendships for your pets in your local community!
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default PetsNearMe; 