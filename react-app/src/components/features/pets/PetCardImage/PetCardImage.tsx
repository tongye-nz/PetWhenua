import React from 'react';
import {
  Box,
  CardMedia,
  Avatar,
  IconButton
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

export interface PetCardImageProps {
  profilePicture?: string;
  petName: string;
  imageHeight: number;
  compact: boolean;
  showActions: boolean;
  hasActions: boolean;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const PetCardImage: React.FC<PetCardImageProps> = ({
  profilePicture,
  petName,
  imageHeight,
  compact,
  showActions,
  hasActions,
  onMenuClick
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {profilePicture ? (
        <CardMedia
          component="img"
          height={imageHeight}
          image={profilePicture}
          alt={`${petName}'s photo`}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: imageHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
            color: 'grey.500'
          }}
        >
          <Avatar
            sx={{ 
              width: compact ? 60 : 80, 
              height: compact ? 60 : 80, 
              fontSize: compact ? '2rem' : '3rem',
              bgcolor: 'primary.light'
            }}
          >
            🐾
          </Avatar>
        </Box>
      )}
      
      {showActions && hasActions && (
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          }}
          onClick={onMenuClick}
          size="small"
        >
          <MoreVert />
        </IconButton>
      )}
    </Box>
  );
};

export default PetCardImage;
