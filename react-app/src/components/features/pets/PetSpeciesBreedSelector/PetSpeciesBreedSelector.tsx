import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import type { PetFormData, PetFormErrors } from '../../../../models/pet.types';
import { PET_SPECIES, DOG_BREEDS, CAT_BREEDS } from '../../../../models/pet.types';

export interface PetSpeciesBreedSelectorProps {
  formData: PetFormData;
  errors: PetFormErrors;
  onInputChange: (field: keyof PetFormData, value: string | number) => void;
}

const PetSpeciesBreedSelector: React.FC<PetSpeciesBreedSelectorProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  // Get breed options based on selected species
  const getBreedOptions = () => {
    switch (formData.species) {
      case 'dog':
        return DOG_BREEDS.map(breed => ({ value: breed, label: breed }));
      case 'cat':
        return CAT_BREEDS.map(breed => ({ value: breed, label: breed }));
      default:
        return [{ value: 'Mixed Breed', label: 'Mixed Breed' }, { value: 'Other', label: 'Other' }];
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
      <FormControl fullWidth error={!!errors.species} required>
        <InputLabel>Species</InputLabel>
        <Select
          value={formData.species}
          label="Species"
          onChange={(e) => onInputChange('species', e.target.value)}
        >
          {PET_SPECIES.map((species) => (
            <MenuItem key={species.value} value={species.value}>
              {species.label}
            </MenuItem>
          ))}
        </Select>
        {errors.species && <FormHelperText>{errors.species}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Breed</InputLabel>
        <Select
          value={formData.breed}
          label="Breed"
          onChange={(e) => onInputChange('breed', e.target.value)}
          disabled={!formData.species}
        >
          {getBreedOptions().map((breed) => (
            <MenuItem key={breed.value} value={breed.value}>
              {breed.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default PetSpeciesBreedSelector;
