import React from 'react';
import { Box, Avatar, IconButton } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { Text } from '../../../';
import type { UserProfileData } from '../../../../types/userProfile.types';

export interface ProfileAvatarSectionProps {
  profileData: UserProfileData;
  formData: UserProfileData;
  isEditing: boolean;
  onProfilePictureChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  styles: any; // TODO: Type this properly when styles are moved to a proper system
}

const ProfileAvatarSection: React.FC<ProfileAvatarSectionProps> = ({
  profileData,
  formData,
  isEditing,
  onProfilePictureChange,
  styles
}) => {
  return (
    <Box style={styles.leftSection}>
      <Box style={styles.avatarSection}>
        <Avatar
          src={formData.profilePicture || profileData.profilePicture}
          style={styles.avatar}
        >
          {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
        </Avatar>
        
        {isEditing && (
          <Box style={styles.uploadContainer}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-picture-upload"
              type="file"
              onChange={onProfilePictureChange}
            />
            <label htmlFor="profile-picture-upload">
              <IconButton
                component="span"
                style={styles.uploadButton}
              >
                <PhotoCamera />
              </IconButton>
            </label>
            <Text variant="caption" style={styles.uploadText}>
              Change Photo
            </Text>
          </Box>
        )}
        
        <Box style={styles.stats}>
          <Text variant="h6" style={styles.statNumber}>
            {profileData.petCount}
          </Text>
          <Text variant="body2" style={styles.statLabel}>
            Pets Registered
          </Text>
          <Text variant="body2" style={styles.joinDate}>
            Joined {profileData.joinDate}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileAvatarSection; 