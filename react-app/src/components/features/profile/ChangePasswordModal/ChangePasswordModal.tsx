import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ChangePasswordForm } from '../../../forms';

export interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const handleSuccess = (message: string) => {
    if (onSuccess) {
      onSuccess(message);
    }
    onClose(); // Close modal after successful password change
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: (theme) => 
            theme.palette.mode === 'light' 
              ? '0 12px 48px rgba(0, 0, 0, 0.15)' 
              : '0 12px 48px rgba(0, 0, 0, 0.4)',
        },
      }}
    >
      <DialogTitle sx={{ 
        position: 'relative', 
        pr: 6,
        pb: 2,
        fontWeight: 600,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        Security Settings
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
            '&:hover': {
              color: 'grey.700',
              bgcolor: 'grey.100',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        pt: 3,
        pb: 4,
        px: 4,
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '400px',
          mx: 'auto'
        }}>
          <ChangePasswordForm
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal; 