import React from 'react';
import { Box, Stack } from '@mui/material';
import type { CSSProperties } from 'react';
import { Input, LocationSelector } from '../../../';
import { VALIDATION_RULES } from '../../../../utils/userProfileValidation';
import type { UserProfileData, UserProfileFormErrors } from '../../../../types/userProfile.types';

export interface ProfileInfoFormProps {
  formData: UserProfileData;
  errors: UserProfileFormErrors;
  isEditing: boolean;
  onInputChange: (field: keyof UserProfileData, value: string) => void;
  styles?: Record<string, CSSProperties> & {
    rightSection: CSSProperties;
    formSection: CSSProperties;
    nameRow: CSSProperties;
    halfWidth: CSSProperties;
    textField: CSSProperties;
  };
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  formData,
  errors,
  isEditing,
  onInputChange,
}) => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    }}>
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <Stack spacing={2}>
          {/* Name Fields */}
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
          }}>
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              disabled={!isEditing}
              error={!!errors.firstName}
              helperText={errors.firstName}
              sx={{ flex: '1 1 50%', minWidth: 0 }}
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              disabled={!isEditing}
              error={!!errors.lastName}
              helperText={errors.lastName}
              sx={{ flex: '1 1 50%', minWidth: 0 }}
            />
          </Box>

          {/* Username (Read-only) */}
          <Input
            label="Username"
            value={formData.username}
            disabled={true}
            fullWidth
            helperText="Username cannot be changed"
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            disabled={!isEditing}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
          />

          {/* Location Selection */}
          <LocationSelector
            region={formData.region}
            district={formData.district}
            disabled={!isEditing}
            errors={errors}
            onRegionChange={(region: string) => onInputChange('region', region)}
            onDistrictChange={(district: string) => onInputChange('district', district)}
          />

          {/* Bio */}
          <Input
            label="Bio"
            value={formData.bio}
            onChange={(e) => onInputChange('bio', e.target.value)}
            disabled={!isEditing}
            multiline
            rows={4}
            error={!!errors.bio}
            helperText={errors.bio || `${formData.bio.length}/${VALIDATION_RULES.BIO_MAX_LENGTH} characters`}
            fullWidth
            placeholder="Tell us about yourself and your pets..."
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default ProfileInfoForm; 