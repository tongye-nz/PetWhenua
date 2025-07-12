import React from 'react';
import { Box } from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import { Text, Button } from '../../../ui';

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
      <Text variant="h4" weight="bold" sx={{ color: '#2e7d32' }}>
        {title}
      </Text>
      
      {!isEditing ? (
        <Button
          variant="outline"
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
            variant="primary"
            startIcon={<Save />}
            onClick={onSave}
            disabled={!isValid}
            isLoading={isSaving}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#388e3c',
              },
            }}
          >
            Save
          </Button>
          <Button
            variant="outline"
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
