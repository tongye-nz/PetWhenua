import React from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowBack, Edit, Pets } from '@mui/icons-material';
import { Button, Text } from '../../../ui';
import type { Pet } from '../../../../models/pet.types';
import type { PetConnectionStatus } from '../../../../models/petConnection.types';

interface PetProfileHeaderProps {
  pet: Pet;
  isOwnPet: boolean;
  connectionStatus: PetConnectionStatus | null;
  loadingConnection: boolean;
  onBack: () => void;
  onEdit: () => void;
  onConnect: () => void;
}

const PetProfileHeader: React.FC<PetProfileHeaderProps> = ({
  pet,
  isOwnPet,
  connectionStatus,
  loadingConnection,
  onBack,
  onEdit,
  onConnect
}) => {
  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <IconButton onClick={onBack} sx={{ p: 1 }}>
        <ArrowBack />
      </IconButton>
      <Text variant="h4" component="h1">
        {pet.name}
      </Text>
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        {isOwnPet ? (
          <Button
            variant="outline"
            startIcon={<Edit />}
            onClick={onEdit}
          >
            Edit Pet
          </Button>
        ) : (
          <Button
            variant="primary"
            startIcon={<Pets />}
            onClick={onConnect}
            disabled={loadingConnection || connectionStatus === 'Pending'}
          >
            {connectionStatus === 'Pending' 
              ? 'Request Sent' 
              : connectionStatus === 'Accepted'
              ? 'Connected'
              : 'Connect Pets'
            }
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PetProfileHeader; 