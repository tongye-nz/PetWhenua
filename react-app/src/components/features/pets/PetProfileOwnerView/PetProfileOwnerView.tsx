import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Avatar,
  Chip,
  Paper
} from '@mui/material';
import { Cake, Pets, Male, Female } from '@mui/icons-material';
import { blue, pink, grey } from '@mui/material/colors';
import { Text } from '../../../ui';
import type { Pet } from '../../../../models/pet.types';
import { formatPetAge } from '../../../../models/pet.types';
import { getProfilePictureUrl } from '../../../../utils/imageUrlUtils';
import { formatDate as formatDateUtil } from '../../../../utils/dateUtils';

interface PetProfileOwnerViewProps {
  pet: Pet;
}

const PetProfileOwnerView: React.FC<PetProfileOwnerViewProps> = ({ pet }) => {
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
    <Card sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Pet Image Section */}
        <Box sx={{ 
          width: { xs: '100%', md: '300px' }, 
          height: { xs: '250px', md: '350px' },
          position: 'relative'
        }}>
          {pet.profilePicture ? (
            <CardMedia
              component="img"
              image={getProfilePictureUrl(pet.profilePicture)}
              alt={pet.name}
              sx={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                borderRadius: { xs: '4px 4px 0 0', md: '4px 0 0 4px' }
              }}
            />
          ) : (
            <Box sx={{
              width: '100%',
              height: '100%',
              bgcolor: grey[200],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: { xs: '4px 4px 0 0', md: '4px 0 0 4px' }
            }}>
              <Pets sx={{ fontSize: 60, color: grey[400] }} />
            </Box>
          )}
          
          {/* Pet Owner Avatar Overlay */}
          {pet.user && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: 16, 
              left: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '4px 12px 4px 4px',
              backdropFilter: 'blur(4px)'
            }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {pet.user.firstName?.[0] || pet.user.username[0]}
              </Avatar>
              <Text variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {pet.user.firstName && pet.user.lastName 
                  ? `${pet.user.firstName} ${pet.user.lastName}`
                  : pet.user.firstName || pet.user.lastName || pet.user.username}
              </Text>
            </Box>
          )}
        </Box>

        {/* Pet Details Section */}
        <CardContent sx={{ flex: 1, p: 3 }}>
          {/* Pet Name and Basic Info */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Text variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                {pet.name}
              </Text>
              {getGenderIcon()}
            </Box>
            
            {/* Species and Breed Tags */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {pet.species && (
                <Chip 
                  icon={<Pets />}
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
              <Chip 
                icon={<Cake />}
                label={getAgeDisplay()}
                size="small"
                color="info"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Pet Details Grid */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: grey[50] }}>
            <Text variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Pet Details
            </Text>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Text variant="body2" color="text.secondary">Species:</Text>
                <Text variant="body2" sx={{ fontWeight: 500 }}>{pet.species || 'Not specified'}</Text>
              </Box>
              <Box>
                <Text variant="body2" color="text.secondary">Breed:</Text>
                <Text variant="body2" sx={{ fontWeight: 500 }}>{pet.breed || 'Not specified'}</Text>
              </Box>
              <Box>
                <Text variant="body2" color="text.secondary">Age:</Text>
                <Text variant="body2" sx={{ fontWeight: 500 }}>{getAgeDisplay()}</Text>
              </Box>
              <Box>
                <Text variant="body2" color="text.secondary">Gender:</Text>
                <Text variant="body2" sx={{ fontWeight: 500 }}>{pet.gender || 'Not specified'}</Text>
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Text variant="body2" color="text.secondary">Registered:</Text>
                <Text variant="body2" sx={{ fontWeight: 500 }}>
                  {pet.createdAt ? formatDate(pet.createdAt) : 'Unknown'}
                </Text>
              </Box>
            </Box>
          </Paper>

          {/* Description */}
          {pet.description && (
            <Box sx={{ mb: 3 }}>
              <Text variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                {pet.description}
              </Text>
            </Box>
          )}
        </CardContent>
      </Box>
    </Card>
  );
};

export default PetProfileOwnerView; 