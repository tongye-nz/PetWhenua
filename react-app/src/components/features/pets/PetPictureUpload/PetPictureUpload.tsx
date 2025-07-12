import React from 'react';
import {
  Box,
  Avatar,
  IconButton,
  FormHelperText
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';

export interface PetPictureUploadProps {
  profilePicture: string;
  onPictureUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePicture: () => void;
  error?: string;
  compact?: boolean;
}

const PetPictureUpload: React.FC<PetPictureUploadProps> = ({
  profilePicture,
  onPictureUpload,
  onRemovePicture,
  error,
  compact = false
}) => {
  const avatarSize = compact ? 80 : 120;
  const fontSize = compact ? '2rem' : '3rem';

  return (
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <Avatar
        src={profilePicture}
        sx={{ 
          width: avatarSize, 
          height: avatarSize, 
          mx: 'auto', 
          mb: 2,
          bgcolor: 'primary.light',
          fontSize
        }}
      >
        🐾
      </Avatar>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="pet-picture-upload"
          type="file"
          onChange={onPictureUpload}
        />
        <label htmlFor="pet-picture-upload">
          <IconButton color="primary" component="span">
            <PhotoCamera />
          </IconButton>
        </label>
        
        {profilePicture && (
          <IconButton color="error" onClick={onRemovePicture}>
            <Delete />
          </IconButton>
        )}
      </Box>
      
      {error && (
        <FormHelperText error sx={{ textAlign: 'center' }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export default PetPictureUpload;
