import React from 'react';
import {
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { Input } from '../../../ui';
import type { PetFormData, PetFormErrors } from '../../../../models/pet.types';
import { PET_SPECIES, PET_GENDERS, DOG_BREEDS, CAT_BREEDS } from '../../../../models/pet.types';

export interface PetBasicInfoFormProps {
  formData: PetFormData;
  errors: PetFormErrors;
  onInputChange: (field: keyof PetFormData, value: string | number) => void;
}

const PetBasicInfoForm: React.FC<PetBasicInfoFormProps> = ({
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Pet Name */}
      <Input
        fullWidth
        label="Pet Name"
        value={formData.name}
        onChange={(e) => onInputChange('name', e.target.value)}
        error={!!errors.name}
        helperText={errors.name}
        required
      />

      {/* Species and Breed Row */}
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

      {/* Age and Gender Row */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Input
          fullWidth
          label="Age (years)"
          type="number"
          value={formData.age}
          onChange={(e) => onInputChange('age', parseInt(e.target.value) || '')}
          error={!!errors.age}
          helperText={errors.age}
          inputProps={{ min: 0, max: 50 }}
        />

        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            value={formData.gender}
            label="Gender"
            onChange={(e) => onInputChange('gender', e.target.value)}
          >
            {PET_GENDERS.map((gender) => (
              <MenuItem key={gender.value} value={gender.value}>
                {gender.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Description */}
      <Input
        fullWidth
        label="Description"
        multiline
        rows={4}
        value={formData.description}
        onChange={(e) => onInputChange('description', e.target.value)}
        error={!!errors.description}
        helperText={errors.description || `${formData.description.length}/500 characters`}
        placeholder="Tell us about your pet's personality, favorite activities, etc."
      />
    </Box>
  );
};

export default PetBasicInfoForm;
