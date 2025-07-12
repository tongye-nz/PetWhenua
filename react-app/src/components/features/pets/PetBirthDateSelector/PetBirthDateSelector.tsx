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
import { generateBirthYears, getValidBirthMonths } from '../../../../models/pet.types';

export interface PetBirthDateSelectorProps {
  formData: PetFormData;
  errors: PetFormErrors;
  onInputChange: (field: keyof PetFormData, value: string | number) => void;
}

const PetBirthDateSelector: React.FC<PetBirthDateSelectorProps> = ({
  formData,
  errors,
  onInputChange
}) => {
  // Handle birth year change and clear month if it becomes invalid
  const handleBirthYearChange = (value: number) => {
    onInputChange('birthYear', value);
    
    // Check if current birth month is still valid for the new year
    const validMonths = getValidBirthMonths(value);
    const currentMonth = formData.birthMonth;
    
    if (currentMonth && !validMonths.some(month => month.value === currentMonth)) {
      // Clear the birth month if it's no longer valid
      onInputChange('birthMonth', '');
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
      <FormControl fullWidth error={!!errors.birthYear} required>
        <InputLabel>Birth Year</InputLabel>
        <Select
          value={formData.birthYear}
          label="Birth Year"
          onChange={(e) => handleBirthYearChange(e.target.value as number)}
        >
          {generateBirthYears().map((year) => (
            <MenuItem key={year.value} value={year.value}>
              {year.label}
            </MenuItem>
          ))}
        </Select>
        {errors.birthYear && <FormHelperText>{errors.birthYear}</FormHelperText>}
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Birth Month (Optional)</InputLabel>
        <Select
          value={formData.birthMonth || ''}
          label="Birth Month (Optional)"
          onChange={(e) => onInputChange('birthMonth', e.target.value as number)}
        >
          <MenuItem value="">
            <em>Unknown</em>
          </MenuItem>
          {getValidBirthMonths(formData.birthYear).map((month) => (
            <MenuItem key={month.value} value={month.value}>
              {month.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default PetBirthDateSelector;
