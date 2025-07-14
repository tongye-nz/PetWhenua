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
  Alert
} from '@mui/material';
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
      : `${pet.name} (${pet.user?.username || 'Connected'})`;

    return (
      <Chip
        key={petId}
        label={chipLabel}
        color={chipColor}
        variant="outlined"
        size="small"
      />
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
        >
          {selectablePets.map((pet) => (
            <MenuItem 
              key={pet.petId} 
              value={pet.petId}
              disabled={selectedPetIds.length >= 2 && pet.petId !== undefined && !selectedPetIds.includes(pet.petId)}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography variant="body1">
                  {pet.name} - {pet.species} {pet.breed && `(${pet.breed})`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pet.isOwned 
                    ? 'Your pet' 
                    : `Connected via ${pet.user?.username || 'unknown'}`
                  }
                </Typography>
              </Box>
            </MenuItem>
          ))}
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
    </Stack>
  );
};

export default PetWeddingSelection;
