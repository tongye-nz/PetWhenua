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
}

const PetDeleteDialog: React.FC<PetDeleteDialogProps> = ({
  open,
  pet,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Pet</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete {pet?.name}? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PetDeleteDialog;
