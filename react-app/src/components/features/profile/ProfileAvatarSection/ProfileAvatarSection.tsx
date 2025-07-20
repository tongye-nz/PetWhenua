import React from 'react';
import { Box } from '@mui/material';
import type { CSSProperties } from 'react';
import { Text } from '../../../';
import ProfilePicture from '../ProfilePicture';
import type { UserProfileData } from '../../../../types/userProfile.types';
import type { ProcessedImageResult } from '../../../../utils/profileImageUtils';

export interface ProfileAvatarSectionProps {
  profileData: UserProfileData;
  formData: UserProfileData;
  isEditing: boolean;
  onProfilePictureChange: (processedImage: ProcessedImageResult) => void;
  onProfilePictureError?: (error: string) => void;
  styles: Record<string, CSSProperties> & {
    leftSection: CSSProperties;
    avatarSection: CSSProperties;
    stats: CSSProperties;
    statNumber: CSSProperties;
    statLabel: CSSProperties;
    joinDate: CSSProperties;
  };
}

const ProfileAvatarSection: React.FC<ProfileAvatarSectionProps> = ({
  profileData,
  formData,
  isEditing,
  onProfilePictureChange,
  onProfilePictureError,
  styles
}) => {
  return (
    <Box style={styles.leftSection}>
      <Box style={styles.avatarSection}>
        <ProfilePicture
          src={formData.profilePicture || profileData.profilePicture}
          firstName={formData.firstName}
          lastName={formData.lastName}
          isEditing={isEditing}
          size={150} // Match the size from styles.avatar
          onImageChange={onProfilePictureChange}
          onImageError={onProfilePictureError}
        />
        
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