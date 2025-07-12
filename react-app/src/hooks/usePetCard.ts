import { useState } from 'react';
import type { Pet } from '../models/pet.types';

interface UsePetCardProps {
  pet: Pet;
  onView?: (pet: Pet) => void;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
}

export const usePetCard = ({ pet, onView, onEdit, onDelete }: UsePetCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    if (!menuOpen) {
      onView?.(pet);
    }
  };

  const hasActions = !!(onEdit || onDelete || onView);

  return {
    anchorEl,
    menuOpen,
    handleMenuClick,
    handleMenuClose,
    handleCardClick,
    hasActions
  };
};
