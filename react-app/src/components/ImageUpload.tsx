import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  LinearProgress,
  Chip,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Badge,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  DragIndicator,
  Add,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { validateImageFile, compressImage, formatFileSize } from '../utils/imageUtils';

export interface UploadedImage {
  id: string;
  file?: File; // Optional for existing images
  preview: string;
  compressed?: File;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
  size: number;
  compressedSize?: number;
  isExisting?: boolean; // Flag for existing images from server
  originalUrl?: string; // Original server URL for existing images
}

export interface ImageUploadProps {
  maxImages?: number;
  onImagesChange: (images: UploadedImage[]) => void;
  initialImages?: UploadedImage[];
  disabled?: boolean;
  showCompression?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  maxImages = 9,
  onImagesChange,
  initialImages = [],
  disabled = false,
  showCompression = true,
}) => {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [errors, setErrors] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const remainingSlots = maxImages - images.length;

  const processFiles = useCallback(async (files: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const validation = await validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (validFiles.length + images.length > maxImages) {
      const allowedCount = maxImages - images.length;
      validFiles.splice(allowedCount);
      newErrors.push(`Only ${allowedCount} more images can be added (limit: ${maxImages})`);
    }

    setErrors(newErrors);
    if (validFiles.length === 0) return;

    const newImages: UploadedImage[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      size: file.size,
      uploading: false,
      uploaded: false,
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);

    if (showCompression) {
      compressImages(newImages, updatedImages);
    } else {
      onImagesChange(updatedImages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, maxImages, onImagesChange, showCompression]);

  const compressImages = useCallback(async (
    newImages: UploadedImage[],
    allImages: UploadedImage[]
  ) => {
    const updatedImages = [...allImages];

    for (let i = 0; i < newImages.length; i++) {
      const imageIndex = updatedImages.findIndex(img => img.id === newImages[i].id);
      if (imageIndex === -1) continue;

      try {
        updatedImages[imageIndex] = { ...updatedImages[imageIndex], uploading: true };
        setImages([...updatedImages]);

        // Skip compression for existing images that don't have File objects
        if (!newImages[i].file) {
          updatedImages[imageIndex] = {
            ...updatedImages[imageIndex],
            uploading: false,
            uploaded: true,
          };
          continue;
        }

        const compressedFile = await compressImage(newImages[i].file!);
        
        updatedImages[imageIndex] = {
          ...updatedImages[imageIndex],
          compressed: compressedFile,
          compressedSize: compressedFile.size,
          uploading: false,
          uploaded: true,
        };
        
        setImages([...updatedImages]);
        onImagesChange([...updatedImages]);
      } catch (error) {
        console.error('Compression failed:', error);
        updatedImages[imageIndex] = {
          ...updatedImages[imageIndex],
          uploading: false,
          error: 'Compression failed',
        };
        setImages([...updatedImages]);
        setSnackbarMessage('Image compression failed. Please try again.');
        setSnackbarOpen(true);
      }
    }
  }, [onImagesChange]);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      const updatedImages = prev.filter(img => img.id !== imageId);
      onImagesChange(updatedImages);
      return updatedImages;
    });
  }, [onImagesChange]);

  const clearAllImages = useCallback(() => {
    images.forEach(image => URL.revokeObjectURL(image.preview));
    setImages([]);
    onImagesChange([]);
    setErrors([]);
  }, [images, onImagesChange]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles);
  }, [processFiles]);

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    disabled: disabled || remainingSlots <= 0,
  });

  React.useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  return (
    <Box>
      {remainingSlots > 0 && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            mb: 2,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            backgroundColor: isDragActive ? 'primary.light' : 'background.paper',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: disabled ? 'grey.300' : 'primary.main',
              backgroundColor: disabled ? 'background.paper' : 'primary.light',
            },
          }}
        >
          <input {...getInputProps()} />
          <Box textAlign="center">
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Drop images here...'
                : 'Drag & drop images here, or click to select'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Supported formats: JPEG, PNG, GIF, WebP
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {remainingSlots} of {maxImages} slots remaining
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<Add />}
              sx={{ mt: 2 }}
              disabled={disabled}
            >
              Select Images
            </Button>
          </Box>
        </Paper>
      )}

      {errors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Upload Issues:</Typography>
          {errors.map((error, index) => (
            <Typography key={index} variant="body2">• {error}</Typography>
          ))}
        </Alert>
      )}

      {images.length > 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Images ({images.length}/{maxImages})
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={clearAllImages}
              startIcon={<Delete />}
            >
              Clear All
            </Button>
          </Box>

          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
            gap={2}
          >
            {images.map((image, index) => (
              <Card key={image.id} sx={{ position: 'relative' }}>
                {image.uploading && (
                  <LinearProgress
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      zIndex: 2,
                    }}
                  />
                )}

                <Badge
                  badgeContent={
                    image.error ? (
                      <Warning color="error" />
                    ) : image.uploaded ? (
                      <CheckCircle color="success" />
                    ) : image.uploading ? (
                      <CircularProgress size={16} />
                    ) : null
                  }
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                  }}
                >
                  <span />
                </Badge>

                <CardMedia
                  component="img"
                  height="120"
                  image={image.preview}
                  alt={`Upload ${index + 1}`}
                  sx={{
                    objectFit: 'cover',
                    opacity: image.uploading ? 0.7 : 1,
                  }}
                />

                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="caption" display="block" noWrap>
                    {image.file?.name || `Existing Image ${index + 1}`}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(image.size)}
                      </Typography>
                      {showCompression && image.compressedSize && (
                        <Typography variant="caption" color="success.main" display="block">
                          → {formatFileSize(image.compressedSize)}
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <IconButton
                        size="small"
                        sx={{ cursor: 'grab' }}
                      >
                        <DragIndicator fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeImage(image.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {image.error && (
                    <Typography variant="caption" color="error" display="block">
                      {image.error}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {images.length > 0 && showCompression && (
        <Box mt={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Compression Summary
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip
                label={`Original: ${formatFileSize(
                  images.reduce((total, img) => total + img.size, 0)
                )}`}
                variant="outlined"
              />
              <Chip
                label={`Compressed: ${formatFileSize(
                  images.reduce((total, img) => total + (img.compressedSize || img.size), 0)
                )}`}
                color="success"
                variant="outlined"
              />
              <Chip
                label={`Saved: ${Math.round(
                  ((images.reduce((total, img) => total + img.size, 0) -
                    images.reduce((total, img) => total + (img.compressedSize || img.size), 0)) /
                    images.reduce((total, img) => total + img.size, 0)) * 100
                )}%`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Paper>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        autoHideDuration={6000}
      />
    </Box>
  );
};

export default ImageUpload;