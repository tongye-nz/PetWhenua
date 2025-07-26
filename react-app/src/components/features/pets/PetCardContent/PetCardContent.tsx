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
import { getNzNow } from '../../../../utils/dateUtils';

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
          // Parse the UTC date and get current NZ time for comparison
          const createdDate = new Date(pet.createdAt + (pet.createdAt.endsWith('Z') ? '' : 'Z'));
          const now = getNzNow();
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
    <CardContent sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column',
      pb: 2,
      '&:last-child': { pb: 2 } // Override MUI default padding
    }}>
      {/* Pet Name - Essential info, never truncated in height but can truncate width */}
      <Text 
        variant={compact ? "h6" : "h5"} 
        component="h3" 
        weight="bold"
        sx={{ 
          mb: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minHeight: compact ? '1.5rem' : '2rem' // Reserve minimum space
        }}
      >
        {pet.name}
      </Text>

      {/* Species and Breed Chips - Essential info, always visible */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        mb: 1, 
        flexWrap: 'wrap',
        minHeight: '24px' // Reserve space even if no chips
      }}>
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

      {/* Age and Gender - Essential info, always visible */}
      <Text variant="body2" color="text.secondary" sx={{ 
        mb: 1,
        minHeight: '1.25rem' // Reserve minimum space
      }}>
        {getAgeText()}
        {pet.gender && ` • ${pet.gender}`}
      </Text>

      {/* Description - This is the only content that should be truncated */}
      {pet.description && (
        <Text 
          variant="body2" 
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 3 : 4, // Increased line clamp
            WebkitBoxOrient: 'vertical',
            mb: 1,
            lineHeight: 1.4,
            // Set a maximum height to prevent overflow
            maxHeight: compact ? '4.2rem' : '5.6rem' // 3-4 lines with line-height 1.4
          }}
        >
          {pet.description}
        </Text>
      )}

      {/* Owner info and connection button - Always at bottom */}
      {pet.user && (
        <Box sx={{ 
          mt: 'auto', 
          pt: 1,
          minHeight: '20px' // Reserve minimum space
        }}>
          <Text variant="caption" color="text.secondary" sx={{
            display: 'block',
            mb: showConnectionButton && !isOwnPet && currentUserPetId && pet.petId ? 1 : 0
          }}>
            Owner: {pet.user.firstName || pet.user.username}
          </Text>
          
          {/* Pet Connection Button - only show for other users' pets */}
          {showConnectionButton && !isOwnPet && currentUserPetId && pet.petId && (
            <PetConnectionButton
              myPetId={currentUserPetId}
              targetPetId={pet.petId}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </CardContent>
  );
};

export default PetCardContent;
