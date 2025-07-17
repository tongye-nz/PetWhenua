import React, { useState } from 'react';
import { Button, Alert, Snackbar } from '@mui/material';
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleFollowToggle = async (event: React.MouseEvent) => {
    // Prevent event bubbling to parent components (like PostCard)
    event.preventDefault();
    event.stopPropagation();
    
    if (loading || disabled) return;

    setLoading(true);
    try {
      if (currentlyFollowing) {
        await userFollowService.unfollowUser(userId);
        setCurrentlyFollowing(false);
        setAlertMessage('Successfully unfollowed user');
        setShowSuccess(true);
        onFollowChange?.(false);
      } else {
        await userFollowService.followUser(userId);
        setCurrentlyFollowing(true);
        setAlertMessage('Successfully followed user');
        setShowSuccess(true);
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error('Failed to toggle follow status:', error);
      
      // Handle specific "already following" error
      const errorMessage = (error as any)?.response?.data || (error as any)?.message || '';
      
      if (errorMessage.includes('already being followed') || errorMessage.includes('already followed')) {
        // User is already following - treat this as success and update the state
        setCurrentlyFollowing(true);
        setAlertMessage('You are already following this user');
        setShowSuccess(true);
        onFollowChange?.(true);
      } else {
        // Generic error
        setAlertMessage('Failed to update follow status. Please try again.');
        setShowError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setShowSuccess(false);
    setShowError(false);
  };

  return (
    <>
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

      {/* Success Alert */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Error Alert */}
      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FollowButton;
