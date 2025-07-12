import React from 'react';
import { Box, Avatar, IconButton } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { Text } from '../../../ui';

export interface ProfilePictureProps {
  src?: string;
  firstName: string;
  lastName: string;
  isEditing: boolean;
  size?: number;
  onImageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  firstName,
  lastName,
  isEditing,
  size = 150,
  onImageChange,
}) => {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 1,
    }}>
      <Avatar
        src={src}
        sx={{
          width: size,
          height: size,
          fontSize: size / 4,
          fontWeight: 'bold',
          backgroundColor: '#4caf50',
          color: 'white',
        }}
      >
        {initials}
      </Avatar>
      
      {isEditing && onImageChange && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 0.5,
        }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-picture-upload"
            type="file"
            onChange={onImageChange}
          />
          <label htmlFor="profile-picture-upload">
            <IconButton
              component="span"
              sx={{
                backgroundColor: '#e8f5e8',
                color: '#4caf50',
                '&:hover': {
                  backgroundColor: '#c8e6c9',
                },
              }}
            >
              <PhotoCamera />
            </IconButton>
          </label>
          <Text variant="caption" sx={{ color: '#666' }}>
            Change Photo
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default ProfilePicture;
