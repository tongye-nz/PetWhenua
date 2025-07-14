import React from 'react';
import {
  CardContent,
  Box,
  Chip
} from '@mui/material';
import { Text, PetConnectionButton } from '../../../ui';
import type { Pet } from '../../../../models/pet.types';
import { formatPetAge } from '../../../../models/pet.types';
import { useAuth } from '../../../../contexts/AuthContext';

export interface PetCardContentProps {
  pet: Pet;
  compact: boolean;
  currentUserPetId?: number; // ID of current user's pet for connections
  showConnectionButton?: boolean;
}

const PetCardContent: React.FC<PetCardContentProps> = ({
  pet,
  compact,
  currentUserPetId,
  showConnectionButton = false
}) => {
  const { user } = useAuth();
  const isOwnPet = user?.userId === pet.userId;
  const getAgeText = () => {
    // Use new birth year/month if available, otherwise fall back to age
    if (pet.birthYear) {
      return formatPetAge(pet.birthYear, pet.birthMonth);
    } else if (pet.age !== undefined) {
      // Enhanced legacy age display to show months for young pets
      if (pet.age === 0) {
        // For pets marked as 0 years old, try to estimate months from creation date
        if (pet.createdAt) {
          const createdDate = new Date(pet.createdAt);
          const now = new Date();
          const monthsDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
          
          if (monthsDiff >= 1) {
            return monthsDiff === 1 ? '1 month old' : `${monthsDiff} months old`;
          } else {
            return 'Less than 1 month old';
          }
        }
        return 'Less than 1 year old';
      }
      if (pet.age === 1) return '1 year old';
      return `${pet.age} years old`;
    }
    return 'Age unknown';
  };

  return (
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Text 
        variant={compact ? "h6" : "h5"} 
        component="h3" 
        weight="bold"
        sx={{ 
          mb: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {pet.name}
      </Text>

      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        {pet.species && (
          <Chip 
            label={pet.species} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        )}
        {pet.breed && (
          <Chip 
            label={pet.breed} 
            size="small" 
            color="secondary" 
            variant="outlined"
          />
        )}
      </Box>

      <Text variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {getAgeText()}
        {pet.gender && ` • ${pet.gender}`}
      </Text>

      {pet.description && (
        <Text 
          variant="body2" 
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            flexGrow: 1
          }}
        >
          {pet.description}
        </Text>
      )}

      {pet.user && (
        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Text variant="caption" color="text.secondary">
            Owner: {pet.user.firstName || pet.user.username}
          </Text>
          
          {/* Pet Connection Button - only show for other users' pets */}
          {showConnectionButton && !isOwnPet && currentUserPetId && pet.petId && (
            <Box sx={{ mt: 1 }}>
              <PetConnectionButton
                myPetId={currentUserPetId}
                targetPetId={pet.petId}
                size="small"
                variant="outlined"
              />
            </Box>
          )}
        </Box>
      )}
    </CardContent>
  );
};

export default PetCardContent;
