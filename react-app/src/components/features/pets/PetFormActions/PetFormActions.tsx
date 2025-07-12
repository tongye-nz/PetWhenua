import React from 'react';
import { Box } from '@mui/material';
import { Button } from '../../../ui';

export interface PetFormActionsProps {
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  showCancel?: boolean;
}

const PetFormActions: React.FC<PetFormActionsProps> = ({
  onCancel,
  isLoading = false,
  submitLabel = 'Save Pet',
  showCancel = true
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
      {showCancel && onCancel && (
        <Button
          variant="error"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      )}
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        sx={{ minWidth: 120 }}
      >
        {submitLabel}
      </Button>
    </Box>
  );
};

export default PetFormActions;
