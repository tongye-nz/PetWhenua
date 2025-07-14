import React, { useState } from 'react';
import { Button } from '@mui/material';
import { PersonAdd, PersonRemove } from '@mui/icons-material';
import { userFollowService } from '../../../api/userFollow.api';

export interface FollowButtonProps {
  userId: number;
  isFollowing: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  isFollowing,
  disabled = false,
  size = 'medium',
  variant = 'contained',
  onFollowChange
}) => {
  const [loading, setLoading] = useState(false);
  const [currentlyFollowing, setCurrentlyFollowing] = useState(isFollowing);

  const handleFollowToggle = async () => {
    if (loading || disabled) return;

    setLoading(true);
    try {
      if (currentlyFollowing) {
        await userFollowService.unfollowUser(userId);
        setCurrentlyFollowing(false);
        onFollowChange?.(false);
      } else {
        await userFollowService.followUser(userId);
        setCurrentlyFollowing(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error('Failed to toggle follow status:', error);
      // Could add error notification here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleFollowToggle}
      disabled={disabled || loading}
      startIcon={currentlyFollowing ? <PersonRemove /> : <PersonAdd />}
      color={currentlyFollowing ? 'secondary' : 'primary'}
      sx={{
        minWidth: '120px',
        textTransform: 'none',
        fontWeight: 600,
        '&.Mui-disabled': {
          opacity: 0.6
        }
      }}
    >
      {loading 
        ? 'Loading...' 
        : currentlyFollowing 
          ? 'Unfollow' 
          : 'Follow'
      }
    </Button>
  );
};

export default FollowButton;
