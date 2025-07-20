import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Chip
} from '@mui/material';
import { Cake, Pets, Male, Female } from '@mui/icons-material';
import { blue, pink, grey } from '@mui/material/colors';
import { Button, Text } from '../../../ui';
import type { Pet } from '../../../../models/pet.types';
import type { PetConnectionStatus } from '../../../../models/petConnection.types';
import { formatPetAge } from '../../../../models/pet.types';
import { getProfilePictureUrl } from '../../../../utils/imageUrlUtils';
import { formatDate as formatDateUtil } from '../../../../utils/dateUtils';

interface PetProfilePublicViewProps {
  pet: Pet;
  connectionStatus: PetConnectionStatus | null;
  loadingConnection: boolean;
  onConnect: () => void;
}

const PetProfilePublicView: React.FC<PetProfilePublicViewProps> = ({
  pet,
  connectionStatus,
  loadingConnection,
  onConnect
}) => {
  const formatDate = (dateString: string) => {
    return formatDateUtil(dateString);
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
      return <Male sx={{ color: blue[500], fontSize: 20 }} />;
    } else if (gender === 'female' || gender === 'f') {
      return <Female sx={{ color: pink[500], fontSize: 20 }} />;
    }
    return null;
  };

  return (
    <>
      {/* Centered Pet Avatar */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          p: 4
        }}>
          {/* Large Centered Pet Avatar */}
          <Box sx={{ mb: 3 }}>
            {pet.profilePicture ? (
              <Avatar
                src={getProfilePictureUrl(pet.profilePicture)}
                sx={{ 
                  width: 200, 
                  height: 200, 
                  boxShadow: 3,
                  border: '4px solid',
                  borderColor: 'primary.main'
                }}
              />
            ) : (
              <Avatar sx={{ 
                width: 200, 
                height: 200, 
                bgcolor: grey[200],
                boxShadow: 3,
                border: '4px solid',
                borderColor: 'primary.main'
              }}>
                <Pets sx={{ fontSize: 80, color: grey[400] }} />
              </Avatar>
            )}
          </Box>

          {/* Pet Name and Basic Info - Centered */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Text variant="h3" component="h1" sx={{ fontWeight: 600 }}>
                {pet.name}
              </Text>
              {getGenderIcon()}
            </Box>
            
            {/* Owner Info */}
            {pet.user && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 2,
                p: 1.5,
                bgcolor: grey[50],
                borderRadius: 2
              }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {pet.user.firstName?.[0] || pet.user.username[0]}
                </Avatar>
                <Text variant="body2" sx={{ fontWeight: 500 }}>
                  Owned by {pet.user.firstName && pet.user.lastName 
                    ? `${pet.user.firstName} ${pet.user.lastName}`
                    : pet.user.firstName || pet.user.lastName || pet.user.username}
                </Text>
              </Box>
            )}
            
            {/* Species and Breed Tags - Centered */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
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
              <Chip 
                icon={<Cake />}
                label={getAgeDisplay()}
                color="info"
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Pet Basic Information Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Text variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
            Pet Information
          </Text>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
            gap: 3,
            maxWidth: 500,
            mx: 'auto'
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Text variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                Species
              </Text>
              <Text variant="body1" sx={{ fontWeight: 500 }}>
                {pet.species || 'Not specified'}
              </Text>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Text variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                Breed
              </Text>
              <Text variant="body1" sx={{ fontWeight: 500 }}>
                {pet.breed || 'Not specified'}
              </Text>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Text variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                Age
              </Text>
              <Text variant="body1" sx={{ fontWeight: 500 }}>
                {getAgeDisplay()}
              </Text>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Text variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                Gender
              </Text>
              <Text variant="body1" sx={{ fontWeight: 500 }}>
                {pet.gender || 'Not specified'}
              </Text>
            </Box>
            <Box sx={{ textAlign: 'center', gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Text variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                Member Since
              </Text>
              <Text variant="body1" sx={{ fontWeight: 500 }}>
                {pet.createdAt ? formatDate(pet.createdAt) : 'Unknown'}
              </Text>
            </Box>
          </Box>

          {/* Description */}
          {pet.description && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Text variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                About {pet.name}
              </Text>
              <Text variant="body1" sx={{ 
                lineHeight: 1.6, 
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto'
              }}>
                {pet.description}
              </Text>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Connect Button Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Text variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Connect with {pet.name}
          </Text>
          <Text variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            Send a connection request to enable interactions and potential playdates between your pets.
          </Text>
          <Button 
            variant="primary" 
            size="large"
            startIcon={<Pets />}
            onClick={onConnect}
            disabled={loadingConnection || connectionStatus === 'Pending'}
            sx={{ 
              minWidth: 200,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            {connectionStatus === 'Pending' 
              ? 'Request Sent' 
              : connectionStatus === 'Accepted'
              ? 'Connected'
              : 'Connect Pets'
            }
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default PetProfilePublicView; 