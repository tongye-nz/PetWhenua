import React from 'react';
import {
  CardContent,
  Box,
  Chip
} from '@mui/material';
import { Text } from '../../../ui';
import type { Pet } from '../../../../models/pet.types';

export interface PetCardContentProps {
  pet: Pet;
  compact: boolean;
}

const PetCardContent: React.FC<PetCardContentProps> = ({
  pet,
  compact
}) => {
  const getAgeText = (age: number) => {
    if (age === 0) return 'Less than 1 year';
    if (age === 1) return '1 year old';
    return `${age} years old`;
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
        {getAgeText(pet.age)}
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
        </Box>
      )}
    </CardContent>
  );
};

export default PetCardContent;
