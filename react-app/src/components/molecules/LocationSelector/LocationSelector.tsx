import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useLocationSelector } from '../../../hooks/useLocationSelector';
import type { UserProfileFormErrors } from '../../../types/userProfile.types';

interface LocationSelectorProps {
  region: string;
  district: string;
  disabled?: boolean;
  errors?: Pick<UserProfileFormErrors, 'region' | 'district'>;
  onRegionChange: (region: string) => void;
  onDistrictChange: (district: string) => void;
  style?: React.CSSProperties;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  region,
  district,
  disabled = false,
  errors = {},
  onRegionChange,
  onDistrictChange,
  style
}) => {
  const {
    selectedRegion,
    selectedDistrict,
    isDistrictDisabled,
    districts,
    regions,
    isLoading,
    handleRegionChange,
    handleDistrictChange,
  } = useLocationSelector(region, district);

  // Sync with parent component
  React.useEffect(() => {
    if (selectedRegion !== region) {
      onRegionChange(selectedRegion);
    }
  }, [selectedRegion, region, onRegionChange]);

  React.useEffect(() => {
    if (selectedDistrict !== district) {
      onDistrictChange(selectedDistrict);
    }
  }, [selectedDistrict, district, onDistrictChange]);

  const handleInternalRegionChange = (event: SelectChangeEvent<string>) => {
    const newRegion = event.target.value;
    handleRegionChange(newRegion);
    onRegionChange(newRegion);
  };

  const handleInternalDistrictChange = (event: SelectChangeEvent<string>) => {
    const newDistrict = event.target.value;
    handleDistrictChange(newDistrict);
    onDistrictChange(newDistrict);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
        <CircularProgress size={24} />
        <Box ml={2}>Loading location data...</Box>
      </Box>
    );
  }

  return (
    <Box style={{ display: 'flex', gap: '1rem', width: '100%', ...style }}>
      <FormControl 
        style={{ flex: 1 }} 
        disabled={disabled}
        error={!!errors.region}
      >
        <InputLabel>Region</InputLabel>
        <Select
          value={selectedRegion}
          label="Region"
          onChange={handleInternalRegionChange}
        >
          <MenuItem value="">
            <em>Select a region</em>
          </MenuItem>
          {regions.map((region) => (
            <MenuItem key={region.LocalityId} value={region.Name}>
              {region.Name}
            </MenuItem>
          ))}
        </Select>
        {errors.region && (
          <Typography variant="caption" color="error" style={{ marginTop: '4px', marginLeft: '14px' }}>
            {errors.region}
          </Typography>
        )}
      </FormControl>
      
      <FormControl 
        style={{ flex: 1 }} 
        disabled={disabled || isDistrictDisabled}
        error={!!errors.district}
      >
        <InputLabel>District</InputLabel>
        <Select
          value={selectedDistrict}
          label="District"
          onChange={handleInternalDistrictChange}
        >
          <MenuItem value="">
            <em>{selectedRegion ? 'Select a district' : 'Select a region first'}</em>
          </MenuItem>
          {districts.map((district) => (
            <MenuItem key={district} value={district}>
              {district}
            </MenuItem>
          ))}
        </Select>
        {errors.district && (
          <Typography variant="caption" color="error" style={{ marginTop: '4px', marginLeft: '14px' }}>
            {errors.district}
          </Typography>
        )}
      </FormControl>
    </Box>
  );
}; 