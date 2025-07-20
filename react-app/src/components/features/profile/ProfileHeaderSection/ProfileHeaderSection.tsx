import React from 'react';
import { Box } from '@mui/material';
import type { CSSProperties } from 'react';
import { Button, Text } from '../../../ui';

export interface ProfileHeaderSectionProps {
  isEditing: boolean;
  isLoading: boolean;
  isValid: boolean;
  isOwnProfile?: boolean;
  profileName?: string;
  onStartEditing: () => void;
  onSaveForm: () => void;
  onCancelEditing: () => void;
  styles: Record<string, CSSProperties> & {
    header: CSSProperties;
    title: CSSProperties;
  };
}

const ProfileHeaderSection: React.FC<ProfileHeaderSectionProps> = ({
  isEditing,
  isLoading,
  isValid,
  isOwnProfile = true,
  profileName,
  onStartEditing,
  onSaveForm,
  onCancelEditing,
  styles
}) => {
  const getTitle = () => {
    if (isOwnProfile) {
      return 'My Profile';
    }
    if (profileName) {
      return `${profileName}'s Profile`;
    }
    return 'User Profile';
  };

  return (
    <Box style={styles.header}>
      <Text variant="h4" style={styles.title}>
        {getTitle()}
      </Text>
      {!isEditing && isOwnProfile ? (
        <Button
          variant="outline"
          onClick={onStartEditing}
        >
          Edit Profile
        </Button>
      ) : isOwnProfile && isEditing ? (
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
      ) : null}
    </Box>
  );
};

export default ProfileHeaderSection; 