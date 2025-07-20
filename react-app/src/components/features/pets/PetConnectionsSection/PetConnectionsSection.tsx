import React from 'react';
import { Paper, Box, Avatar } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Text, LoadingSpinner } from '../../../ui';
import type { Pet } from '../../../../models/pet.types';
import { getProfilePictureUrl } from '../../../../utils/imageUrlUtils';

interface PetConnectionsSectionProps {
  pet: Pet;
  isOwnPet: boolean;
  connectedPets: Pet[];
  loadingConnectedPets: boolean;
  onPetClick: (petId: number) => void;
}

const PetConnectionsSection: React.FC<PetConnectionsSectionProps> = ({
  pet,
  isOwnPet,
  connectedPets,
  loadingConnectedPets,
  onPetClick
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Text variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: isOwnPet ? 'left' : 'center' }}>
        {isOwnPet ? 'Connections' : `${pet.name}'s Friends`}
      </Text>
      
      {/* Connected Pets */}
      {loadingConnectedPets ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <LoadingSpinner size="small" />
        </Box>
      ) : connectedPets.length > 0 ? (
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          justifyContent: isOwnPet ? 'flex-start' : 'center'
        }}>
          {connectedPets.map((connectedPet) => (
            <Box 
              key={connectedPet.petId} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: grey[50],
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => connectedPet.petId && onPetClick(connectedPet.petId)}
            >
              <Avatar 
                src={getProfilePictureUrl(connectedPet.profilePicture)}
                sx={{ 
                  width: isOwnPet ? 48 : 56, 
                  height: isOwnPet ? 48 : 56, 
                  bgcolor: 'primary.main',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  boxShadow: 1
                }}
              >
                {!connectedPet.profilePicture && connectedPet.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Text variant="caption" sx={{ 
                fontWeight: 500, 
                textAlign: 'center',
                maxWidth: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {connectedPet.name}
              </Text>
            </Box>
          ))}
        </Box>
      ) : (
        <Text variant="body2" color="text.secondary" sx={{ 
          fontStyle: 'italic',
          textAlign: 'center',
          py: 2
        }}>
          {isOwnPet 
            ? 'No connections yet. Connect with other pets to build your network!' 
            : `${pet.name} hasn't connected with any pets yet.`
          }
        </Text>
      )}
    </Paper>
  );
};

export default PetConnectionsSection; 