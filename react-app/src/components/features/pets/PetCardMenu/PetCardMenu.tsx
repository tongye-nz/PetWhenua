import React from 'react';
import {
  Menu,
  MenuItem
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import type { Pet } from '../../../../models/pet.types';

export interface PetCardMenuProps {
  pet: Pet;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onView?: (pet: Pet) => void;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
}

const PetCardMenu: React.FC<PetCardMenuProps> = ({
  pet,
  anchorEl,
  open,
  onClose,
  onView,
  onEdit,
  onDelete
}) => {
  const handleViewClick = () => {
    onClose();
    onView?.(pet);
  };

  const handleEditClick = () => {
    onClose();
    onEdit?.(pet);
  };

  const handleDeleteClick = () => {
    onClose();
    onDelete?.(pet);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      {onView && (
        <MenuItem onClick={handleViewClick}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
      )}
      {onEdit && (
        <MenuItem onClick={handleEditClick}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
      )}
      {onDelete && (
        <MenuItem onClick={handleDeleteClick}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      )}
    </Menu>
  );
};

export default PetCardMenu;
