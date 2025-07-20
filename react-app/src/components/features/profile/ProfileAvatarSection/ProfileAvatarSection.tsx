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
  styles?: Record<string, CSSProperties> & {
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
}) => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      mb: 3,
    }}>
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        mb: 3,
      }}>
        <ProfilePicture
          src={formData.profilePicture || profileData.profilePicture}
          firstName={formData.firstName}
          lastName={formData.lastName}
          isEditing={isEditing}
          size={150}
          onImageChange={onProfilePictureChange}
          onImageError={onProfilePictureError}
        />
        
        <Box sx={{ 
          bgcolor: 'primary.50',
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'primary.100',
          width: '100%',
          mt: 2,
        }}>
          <Text variant="h6" sx={{ 
            color: 'primary.main',
            fontWeight: 'bold',
            fontSize: '2rem',
            mb: 1,
          }}>
            {profileData.petCount}
          </Text>
          <Text variant="body2" sx={{ 
            color: 'text.secondary',
            fontWeight: '500',
            mb: 1,
          }}>
            Pets Registered
          </Text>
          <Text variant="body2" sx={{ 
            color: 'text.disabled',
            fontSize: '0.875rem',
          }}>
            Joined {profileData.joinDate}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileAvatarSection; 