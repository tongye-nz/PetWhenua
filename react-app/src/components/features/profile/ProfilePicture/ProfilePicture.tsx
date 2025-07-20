import React, { useState } from 'react';
import { Box, Avatar, IconButton, CircularProgress, Alert } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { Text } from '../../../ui';
import { processUserProfileImage } from '../../../../utils/profileImageUtils';
import { getProfilePictureUrl } from '../../../../utils/imageUrlUtils';
import type { ProcessedImageResult } from '../../../../utils/profileImageUtils';

export interface ProfilePictureProps {
  src?: string;
  firstName: string;
  lastName: string;
  isEditing: boolean;
  size?: number;
  onImageChange?: (processedImage: ProcessedImageResult) => void;
  onImageError?: (error: string) => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  firstName,
  lastName,
  isEditing,
  size = 150,
  onImageChange,
  onImageError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
  const fullImageUrl = getProfilePictureUrl(src);
  
  // Debug logging to track image URL changes
  React.useEffect(() => {
    console.log('ProfilePicture src changed:', { src, fullImageUrl });
  }, [src, fullImageUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setError(null);
    setIsProcessing(true);

    try {
      // Process the image with auto-crop, resize, and compress
      const processedImage = await processUserProfileImage(file);
      
      // Call the parent callback with processed image
      if (onImageChange) {
        onImageChange(processedImage);
      }

      console.log(`Profile image processed: ${(processedImage.originalSize / 1024).toFixed(1)}KB → ${(processedImage.processedSize / 1024).toFixed(1)}KB (${Math.round(processedImage.compressionRatio * 100)}% of original)`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(errorMessage);
      
      if (onImageError) {
        onImageError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
      // Reset the input value to allow re-selecting the same file
      event.target.value = '';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 1,
    }}>
      <Avatar
        src={fullImageUrl}
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
      
      {isEditing && (
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
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          <label htmlFor="profile-picture-upload">
            <IconButton
              component="span"
              disabled={isProcessing}
              sx={{
                backgroundColor: '#e8f5e8',
                color: '#4caf50',
                '&:hover': {
                  backgroundColor: '#c8e6c9',
                },
                '&:disabled': {
                  backgroundColor: '#f5f5f5',
                  color: '#999',
                },
              }}
            >
              {isProcessing ? <CircularProgress size={24} /> : <PhotoCamera />}
            </IconButton>
          </label>
          <Text variant="caption" sx={{ color: '#666' }}>
            {isProcessing ? 'Processing...' : 'Change Photo'}
          </Text>
          
          {error && (
            <Alert severity="error" sx={{ mt: 1, maxWidth: 250 }}>
              <Text variant="caption">{error}</Text>
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProfilePicture;
