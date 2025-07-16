import React, { useState } from 'react';
import { Button, Chip } from '@mui/material';
import { Pets, Send, Check, Close, Block } from '@mui/icons-material';
import { petConnectionService } from '../../../api/petConnection.api';
import type { PetConnectionStatus } from '../../../models/petConnection.types';

export interface PetConnectionButtonProps {
  myPetId: number;
  targetPetId: number;
  connectionStatus?: PetConnectionStatus;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
  onConnectionChange?: (status: PetConnectionStatus) => void;
}

const PetConnectionButton: React.FC<PetConnectionButtonProps> = ({
  myPetId,
  targetPetId,
  connectionStatus,
  disabled = false,
  size = 'medium',
  variant = 'outlined',
  onConnectionChange
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PetConnectionStatus | undefined>(connectionStatus);

  const handleConnectionRequest = async () => {
    if (loading || disabled) return;

    setLoading(true);
    try {
      await petConnectionService.requestConnection({
        pet1Id: myPetId,
        pet2Id: targetPetId,
        message: 'Would like to connect our pets!'
      });
      
      setCurrentStatus('Pending');
      onConnectionChange?.('Pending');
    } catch (error) {
      console.error('Failed to request connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    switch (currentStatus) {
      case 'Pending':
        return {
          icon: <Send />,
          text: 'Request Sent',
          color: 'warning' as const,
          disabled: true
        };
      case 'Accepted':
        return {
          icon: <Check />,
          text: 'Connected',
          color: 'success' as const,
          disabled: true
        };
      case 'Rejected':
        return {
          icon: <Close />,
          text: 'Request Declined',
          color: 'error' as const,
          disabled: true
        };
      case 'Blocked':
        return {
          icon: <Block />,
          text: 'Blocked',
          color: 'error' as const,
          disabled: true
        };
      default:
        return {
          icon: <Pets />,
          text: 'Connect Pets',
          color: 'primary' as const,
          disabled: false
        };
    }
  };

  const buttonProps = getButtonContent();

  if (currentStatus === 'Accepted') {
    return (
      <Chip
        icon={<Check />}
        label="Pets Connected"
        color="success"
        variant="outlined"
        size={size === 'large' ? 'medium' : size}
      />
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleConnectionRequest}
      disabled={disabled || loading || buttonProps.disabled}
      startIcon={buttonProps.icon}
      color={buttonProps.color}
      sx={{
        minWidth: '140px',
        textTransform: 'none',
        fontWeight: 600,
        '&.Mui-disabled': {
          opacity: 0.6
        }
      }}
    >
      {loading ? 'Sending...' : buttonProps.text}
    </Button>
  );
};

export default PetConnectionButton;
