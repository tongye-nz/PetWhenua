import React from 'react';
import {
  Box,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Alert,
  Avatar,
  ListSubheader,
  Divider
} from '@mui/material';
import { Pets } from '@mui/icons-material';
import { getProfilePictureUrl } from '../../../utils/imageUrlUtils';
import type { SelectablePet } from '../../../models/petWedding.types';

export interface PetWeddingSelectionProps {
  selectedPetIds: number[];
  onSelectedPetsChange: (petIds: number[]) => void;
  selectablePets: SelectablePet[];
  loading?: boolean;
  error?: string;
}

const PetWeddingSelection: React.FC<PetWeddingSelectionProps> = ({
  selectedPetIds,
  onSelectedPetsChange,
  selectablePets,
  loading = false,
  error
}) => {
  // Group pets into owned and connected
  const ownedPets = selectablePets.filter(pet => pet.isOwned);
  const connectedPets = selectablePets.filter(pet => !pet.isOwned);

  const handlePetSelection = (event: any) => {
    const value = event.target.value;
    const newSelectedIds = typeof value === 'string' ? value.split(',').map(Number) : value;
    
    // Limit to exactly 2 pets
    if (newSelectedIds.length <= 2) {
      onSelectedPetsChange(newSelectedIds);
    }
  };

  const renderPetChip = (petId: number) => {
    const pet = selectablePets.find(p => p.petId === petId);
    if (!pet) return null;

    const chipColor = pet.isOwned ? 'primary' : 'secondary';
    const chipLabel = pet.isOwned 
      ? `${pet.name} (Your pet)`
      : `${pet.name} (${pet.user?.username || pet.connectionOwner?.username || 'Connected'})`;

    return (
      <Chip
        key={petId}
        label={chipLabel}
        color={chipColor}
        variant="outlined"
        size="small"
        avatar={
          <Avatar 
            src={pet.profilePicture ? getProfilePictureUrl(pet.profilePicture) : undefined}
            sx={{ 
              width: 24, 
              height: 24,
              bgcolor: pet.isOwned ? 'primary.main' : 'secondary.main'
            }}
          >
            {!pet.profilePicture && <Pets sx={{ fontSize: 14 }} />}
          </Avatar>
        }
      />
    );
  };

  const renderPetMenuItem = (pet: SelectablePet) => {
    const ownerName = pet.isOwned 
      ? 'Your pet' 
      : (pet.user?.username || pet.connectionOwner?.username || 'Connected pet');

    return (
      <MenuItem 
        key={pet.petId} 
        value={pet.petId}
        disabled={selectedPetIds.length >= 2 && pet.petId !== undefined && !selectedPetIds.includes(pet.petId)}
        sx={{ py: 1.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Avatar 
            src={pet.profilePicture ? getProfilePictureUrl(pet.profilePicture) : undefined}
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: pet.isOwned ? 'primary.main' : 'secondary.main'
            }}
          >
            {!pet.profilePicture && <Pets />}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body1" noWrap>
              {pet.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {pet.species} {pet.breed && `• ${pet.breed}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ownerName}
            </Typography>
          </Box>
        </Box>
      </MenuItem>
    );
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" gutterBottom>
        Select Two Pets for the Wedding
      </Typography>
      
      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      <FormControl fullWidth required error={selectedPetIds.length !== 2}>
        <InputLabel>Select Pets (Choose exactly 2)</InputLabel>
        <Select
          multiple
          value={selectedPetIds}
          onChange={handlePetSelection}
          input={<OutlinedInput label="Select Pets (Choose exactly 2)" />}
          renderValue={() => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selectedPetIds.map(renderPetChip)}
            </Box>
          )}
          disabled={loading}
          MenuProps={{
            PaperProps: {
              sx: { maxHeight: 400 }
            }
          }}
        >
          {/* Your Pets Section */}
          {ownedPets.length > 0 && (
            <ListSubheader 
              sx={{ 
                bgcolor: 'primary.50',
                color: 'primary.main',
                fontWeight: 600,
                py: 1,
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pets fontSize="small" />
                Your Pets ({ownedPets.length})
              </Box>
            </ListSubheader>
          )}
          {ownedPets.map(renderPetMenuItem)}
          
          {/* Divider between sections */}
          {ownedPets.length > 0 && connectedPets.length > 0 && (
            <Divider sx={{ my: 1 }} />
          )}
          
          {/* Connected Pets Section */}
          {connectedPets.length > 0 && (
            <ListSubheader 
              sx={{ 
                bgcolor: 'secondary.50',
                color: 'secondary.main',
                fontWeight: 600,
                py: 1,
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pets fontSize="small" />
                Connected Pets ({connectedPets.length})
              </Box>
            </ListSubheader>
          )}
          {connectedPets.map(renderPetMenuItem)}
        </Select>
        
        {selectedPetIds.length !== 2 && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            You must select exactly 2 pets for the wedding
          </Typography>
        )}
        
        {selectedPetIds.length === 2 && (
          <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
            Great! You've selected 2 pets for the wedding
          </Typography>
        )}
      </FormControl>

      {selectablePets.length === 0 && (
        <Alert severity="info">
          <Typography variant="body2">
            You need to have pets or pet connections to create a pet wedding. 
            Try adding pets to your profile or connecting with other pet owners first.
          </Typography>
        </Alert>
      )}

      {/* Summary Information */}
      {selectablePets.length > 0 && (
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.50', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Available for Wedding:
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography variant="body2">
              • {ownedPets.length} of your pets
            </Typography>
            <Typography variant="body2">
              • {connectedPets.length} connected pets
            </Typography>
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default PetWeddingSelection;
