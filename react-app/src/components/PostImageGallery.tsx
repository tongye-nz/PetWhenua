import React, { useState } from 'react';
import { 
  Box, 
  ImageList, 
  ImageListItem, 
  Modal, 
  IconButton,
  Typography
} from '@mui/material';
import { Close, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { getFullImageUrl } from '../utils/imageUrlUtils';

export interface PostImageGalleryProps {
  images: string[];
  maxDisplay?: number;
  compact?: boolean;
}

const PostImageGallery: React.FC<PostImageGalleryProps> = ({
  images,
  maxDisplay = 4,
  compact = false
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getImageUrl = (imageUrl: string) => {
    return getFullImageUrl(imageUrl) || imageUrl;
  };

  const getGridCols = () => {
    if (compact) return 2;
    if (displayImages.length === 1) return 1;
    if (displayImages.length === 2) return 2;
    return displayImages.length >= 3 ? 3 : displayImages.length;
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        {/* Single image layout - display with preserved aspect ratio */}
        {displayImages.length === 1 ? (
          <Box
            onClick={() => openLightbox(0)}
            sx={{ 
              cursor: 'pointer',
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              maxHeight: compact ? 250 : 400,
              display: 'flex',
              justifyContent: 'center',
              '&:hover': {
                opacity: 0.8,
                transition: 'opacity 0.2s'
              }
            }}
          >
            <img
              src={getImageUrl(displayImages[0])}
              alt="Post image"
              loading="lazy"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: compact ? 250 : 400,
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
          </Box>
        ) : (
          /* Multiple images grid layout */
          <ImageList 
            variant="quilted" 
            cols={getGridCols()} 
            rowHeight={compact ? 120 : 200}
            gap={8}
          >
            {displayImages.map((image, index) => (
              <ImageListItem 
                key={index}
                onClick={() => openLightbox(index)}
                sx={{ 
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': {
                    opacity: 0.8,
                    transition: 'opacity 0.2s'
                  }
                }}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`Post image ${index + 1}`}
                  loading="lazy"
                  style={{
                    borderRadius: 8,
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                  }}
                />
                
                {/* Show "+" overlay for remaining images */}
                {index === maxDisplay - 1 && remainingCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      color: 'white'
                    }}
                  >
                    <Typography variant="h6">
                      +{remainingCount}
                    </Typography>
                  </Box>
                )}
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Box>

      {/* Lightbox Modal */}
      <Modal
        open={lightboxOpen}
        onClose={closeLightbox}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            outline: 'none'
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={closeLightbox}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            <Close />
          </IconButton>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={prevImage}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
              >
                <ArrowBackIos />
              </IconButton>

              <IconButton
                onClick={nextImage}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}

          {/* Image */}
          <img
            src={getImageUrl(images[currentImageIndex])}
            alt={`Post image ${currentImageIndex + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />

          {/* Image counter */}
          {images.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 2
              }}
            >
              <Typography variant="body2">
                {currentImageIndex + 1} / {images.length}
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default PostImageGallery;
