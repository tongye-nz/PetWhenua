import React, { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  FormHelperText,
  CircularProgress,
  Alert
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { processPetProfileImage } from '../../../../utils/profileImageUtils';
import type { ProcessedImageResult } from '../../../../utils/profileImageUtils';

export interface PetPictureUploadProps {
  profilePicture: string;
  onPictureUpload: (processedImage: ProcessedImageResult) => void;
  onRemovePicture: () => void;
  onPictureError?: (error: string) => void;
  error?: string;
  compact?: boolean;
}

const PetPictureUpload: React.FC<PetPictureUploadProps> = ({
  profilePicture,
  onPictureUpload,
  onRemovePicture,
  onPictureError,
  error,
  compact = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  const avatarSize = compact ? 80 : 120;
  const fontSize = compact ? '2rem' : '3rem';

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setProcessingError(null);
    setIsProcessing(true);

    try {
      // Process the image with auto-crop, resize, and compress for pets
      const processedImage = await processPetProfileImage(file);
      
      // Call the parent callback with processed image
      onPictureUpload(processedImage);

      console.log(`Pet profile image processed: ${(processedImage.originalSize / 1024).toFixed(1)}KB → ${(processedImage.processedSize / 1024).toFixed(1)}KB (${Math.round(processedImage.compressionRatio * 100)}% of original)`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setProcessingError(errorMessage);
      
      if (onPictureError) {
        onPictureError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
      // Reset the input value to allow re-selecting the same file
      event.target.value = '';
    }
  };

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
          onChange={handleFileChange}
          disabled={isProcessing}
        />
        <label htmlFor="pet-picture-upload">
          <IconButton 
            color="primary" 
            component="span"
            disabled={isProcessing}
          >
            {isProcessing ? <CircularProgress size={24} /> : <PhotoCamera />}
          </IconButton>
        </label>
        
        {profilePicture && !isProcessing && (
          <IconButton color="error" onClick={onRemovePicture}>
            <Delete />
          </IconButton>
        )}
      </Box>
      
      {isProcessing && (
        <FormHelperText sx={{ textAlign: 'center', mt: 1 }}>
          Processing image...
        </FormHelperText>
      )}
      
      {(error || processingError) && (
        <Alert severity="error" sx={{ mt: 1, maxWidth: 300, mx: 'auto' }}>
          {error || processingError}
        </Alert>
      )}
    </Box>
  );
};

export default PetPictureUpload;
