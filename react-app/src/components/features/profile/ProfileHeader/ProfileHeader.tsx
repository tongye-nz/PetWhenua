import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';

export interface ProfileHeaderProps {
  title: string;
  isEditing: boolean;
  isSaving: boolean;
  isValid: boolean;
  onStartEditing: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  title,
  isEditing,
  isSaving,
  isValid,
  onStartEditing,
  onSave,
  onCancel,
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: 2,
    }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
        {title}
      </Typography>
      
      {!isEditing ? (
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={onStartEditing}
          sx={{ 
            borderColor: '#4caf50',
            color: '#4caf50',
            '&:hover': {
              borderColor: '#388e3c',
              backgroundColor: 'rgba(76, 175, 80, 0.04)',
            },
          }}
        >
          Edit Profile
        </Button>
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} /> : <Save />}
            onClick={onSave}
            disabled={isSaving || !isValid}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#388e3c',
              },
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={onCancel}
            disabled={isSaving}
            sx={{
              borderColor: '#f44336',
              color: '#f44336',
              '&:hover': {
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(244, 67, 54, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ProfileHeader;
