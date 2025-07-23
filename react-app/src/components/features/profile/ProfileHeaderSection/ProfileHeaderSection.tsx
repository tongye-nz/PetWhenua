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
  onChangePassword?: () => void;
  styles?: Record<string, CSSProperties> & {
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
  onChangePassword,
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
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      flexWrap: 'wrap',
      gap: 2,
    }}>
      <Text variant="h4" sx={{ 
        color: 'text.primary',
        fontWeight: 'bold',
      }}>
        {getTitle()}
      </Text>
      {!isEditing && isOwnProfile ? (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outline"
            onClick={onStartEditing}
          >
            Edit Profile
          </Button>
          {onChangePassword && (
            <Button
              variant="outline"
              onClick={onChangePassword}
            >
              Change Password
            </Button>
          )}
        </Box>
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
          {onChangePassword && (
            <Button
              variant="outline"
              onClick={onChangePassword}
              disabled={isLoading}
            >
              Change Password
            </Button>
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default ProfileHeaderSection; 