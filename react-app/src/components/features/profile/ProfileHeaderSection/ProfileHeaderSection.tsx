import React from 'react';
import { Box } from '@mui/material';
import { Button, Text } from '../../../ui';

export interface ProfileHeaderSectionProps {
  isEditing: boolean;
  isLoading: boolean;
  isValid: boolean;
  onStartEditing: () => void;
  onSaveForm: () => void;
  onCancelEditing: () => void;
  styles: any; // TODO: Type this properly when styles are moved to a proper system
}

const ProfileHeaderSection: React.FC<ProfileHeaderSectionProps> = ({
  isEditing,
  isLoading,
  isValid,
  onStartEditing,
  onSaveForm,
  onCancelEditing,
  styles
}) => {
  return (
    <Box style={styles.header}>
      <Text variant="h4" style={styles.title}>
        My Profile
      </Text>
      {!isEditing ? (
        <Button
          variant="outline"
          onClick={onStartEditing}
        >
          Edit Profile
        </Button>
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="primary"
            onClick={onSaveForm}
            disabled={!isValid}
            isLoading={isLoading}
          >
            Save
          </Button>
          <Button
            variant="error"
            onClick={onCancelEditing}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ProfileHeaderSection; 