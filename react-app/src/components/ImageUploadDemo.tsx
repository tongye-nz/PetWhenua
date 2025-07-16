import React, { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import ImageUpload from './ImageUpload';
import type { UploadedImage } from './ImageUpload';

const ImageUploadDemo: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const handleImagesChange = (images: UploadedImage[]) => {
    setUploadedImages(images);
    console.log('Images updated:', images);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Image Upload Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        This demo shows the ImageUpload component with drag & drop functionality,
        image compression, and preview features.
      </Typography>

      <ImageUpload
        maxImages={9}
        onImagesChange={handleImagesChange}
        showCompression={true}
      />

      {uploadedImages.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Upload Status
          </Typography>
          <Typography variant="body2">
            Total images: {uploadedImages.length}
          </Typography>
          <Typography variant="body2">
            Compressed images: {uploadedImages.filter(img => img.compressed).length}
          </Typography>
          <Typography variant="body2">
            Uploading: {uploadedImages.filter(img => img.uploading).length}
          </Typography>
          <Typography variant="body2">
            Errors: {uploadedImages.filter(img => img.error).length}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ImageUploadDemo;
