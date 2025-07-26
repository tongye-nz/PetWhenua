import React from 'react';
import { Card } from '@mui/material';
import { PetCardImage, PetCardContent, PetCardMenu } from '../';
import { usePetCard } from '../../../../hooks/usePetCard';
import type { Pet } from '../../../../models/pet.types';

export interface PetCardProps {
  pet: Pet;
  onView?: (pet: Pet) => void;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
  showActions?: boolean;
  compact?: boolean;
}

const PetCard: React.FC<PetCardProps> = ({
  pet,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const {
    anchorEl,
    menuOpen,
    handleMenuClick,
    handleMenuClose,
    handleCardClick,
    hasActions
  } = usePetCard({ pet, onView, onEdit, onDelete });

  // Increased heights to provide more space for content
  const cardHeight = compact ? 320 : 400;
  const imageHeight = compact ? 140 : 200;

  return (
    <Card 
      sx={{ 
        height: cardHeight,
        display: 'flex',
        flexDirection: 'column',
        cursor: onView ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: onView ? 'translateY(-4px)' : 'none',
          boxShadow: onView ? 3 : 1,
        }
      }}
      onClick={handleCardClick}
    >
      <PetCardImage
        profilePicture={pet.profilePicture}
        petName={pet.name}
        imageHeight={imageHeight}
        compact={compact}
        showActions={showActions}
        hasActions={hasActions}
        onMenuClick={handleMenuClick}
      />

      <PetCardContent pet={pet} compact={compact} />

      <PetCardMenu
        pet={pet}
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </Card>
  );
};

export default PetCard;
