import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Alert
} from '@mui/material';
import { Pets } from '@mui/icons-material';
import { Text, PetConnectionButton } from '../../../ui';
import { petService } from '../../../../api/pet.api';
import { useAuth } from '../../../../contexts/AuthContext';
import type { Pet } from '../../../../models/pet.types';

export interface UserPetsSectionProps {
  userId: number;
  isOwnProfile: boolean;
}

const UserPetsSection: React.FC<UserPetsSectionProps> = ({
  userId,
  isOwnProfile
}) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentUserPetId, setCurrentUserPetId] = useState<number | null>(null);

  // Load user's pets
  useEffect(() => {
    const loadPets = async () => {
      try {
        setLoading(true);
        setError('');
        
        const userPets = await petService.getUserPets(userId);
        setPets(userPets);
        
        // If not own profile, get current user's first pet for connections
        if (!isOwnProfile && user?.userId) {
          try {
            const currentUserPets = await petService.getUserPets(user.userId);
            if (currentUserPets.length > 0 && currentUserPets[0].petId) {
              setCurrentUserPetId(currentUserPets[0].petId);
            }
          } catch (error) {
            console.debug('Failed to load current user pets:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load pets:', error);
        setError('Failed to load pets');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadPets();
    }
  }, [userId, isOwnProfile, user?.userId]);

  if (loading) {
    return (
      <Card sx={{ 
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        mb: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontWeight: 600,
            fontSize: '1.2rem'
          }}>
            <Pets sx={{ color: 'primary.main' }} />
            {isOwnProfile ? 'My Pets' : 'Pets'}
          </Typography>
          <Text variant="body2" color="text.secondary">
            Loading pets...
          </Text>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ 
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        mb: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontWeight: 600,
            fontSize: '1.2rem'
          }}>
            <Pets sx={{ color: 'primary.main' }} />
            {isOwnProfile ? 'My Pets' : 'Pets'}
          </Typography>
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      mb: 3,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontWeight: 600,
          fontSize: '1.2rem',
          mb: 2
        }}>
          <Pets sx={{ color: 'primary.main' }} />
          {isOwnProfile ? 'My Pets' : 'Pets'} {pets.length > 0 && `(${pets.length})`}
        </Typography>

        {pets.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            color: 'text.secondary'
          }}>
            <Pets sx={{ fontSize: 48, opacity: 0.5, mb: 1, color: 'primary.main' }} />
            <Text variant="body2">
              {isOwnProfile ? "You haven't added any pets yet" : "No pets to display"}
            </Text>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2
          }}>
            {pets.map((pet) => (
              <Card key={pet.petId} sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 2,
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Avatar 
                    src={pet.profilePicture || undefined}
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      mx: 'auto', 
                      mb: 1,
                      bgcolor: 'primary.light',
                      fontSize: '1.5rem'
                    }}
                  >
                    {pet.name?.charAt(0).toUpperCase() || '🐾'}
                  </Avatar>
                  
                  <Text variant="body1" fontWeight="medium" sx={{ mb: 0.5 }}>
                    {pet.name}
                  </Text>
                  
                  <Text variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    {pet.species} {pet.breed && `• ${pet.breed}`}
                  </Text>
                  
                  {pet.gender && (
                    <Text variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                      {pet.gender === 'Male' || pet.gender === 'M' ? '♂️ Male' : 
                       pet.gender === 'Female' || pet.gender === 'F' ? '♀️ Female' : pet.gender}
                    </Text>
                  )}
                  
                  {/* Connect button - only show for other users' pets */}
                  {!isOwnProfile && currentUserPetId && pet.petId && (
                    <PetConnectionButton
                      myPetId={currentUserPetId}
                      targetPetId={pet.petId}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPetsSection; 