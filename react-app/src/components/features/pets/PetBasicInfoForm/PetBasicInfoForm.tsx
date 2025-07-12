import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Input } from '../../../ui';
import type { PetFormData, PetFormErrors } from '../../../../models/pet.types';
import { PET_GENDERS } from '../../../../models/pet.types';
import { PetBirthDateSelector, PetSpeciesBreedSelector } from '../';

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
      <PetSpeciesBreedSelector
        formData={formData}
        errors={errors}
        onInputChange={onInputChange}
      />

      {/* Birth Date and Gender Row */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <PetBirthDateSelector
          formData={formData}
          errors={errors}
          onInputChange={onInputChange}
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
