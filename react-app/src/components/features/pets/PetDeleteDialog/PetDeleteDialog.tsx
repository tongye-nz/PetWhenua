import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { Button } from '../../../ui';
import type { Pet } from '../../../../models/pet.types';

export interface PetDeleteDialogProps {
  open: boolean;
  pet: Pet | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const PetDeleteDialog: React.FC<PetDeleteDialogProps> = ({
  open,
  pet,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  const handleClose = (_: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (isLoading) return; // Prevent closing while loading
    if (reason !== 'backdropClick') {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle>Delete Pet</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete {pet?.name}? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          variant="error" 
          onClick={onConfirm}
          isLoading={isLoading}
          loadingText="Deleting..."
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PetDeleteDialog;
