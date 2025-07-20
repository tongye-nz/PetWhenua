import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { likeService } from '../../../api/like.api';
import { useAuth } from '../../../contexts/AuthContext';


export interface LikeButtonProps {
  postId: number;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  disabled?: boolean;
  onLikeChange?: (isLiked: boolean, likeCount: number) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikeCount = 0,
  initialIsLiked = false,
  size = 'medium',
  showCount = true,
  disabled = false,
  onLikeChange
}) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);

  // Fetch current like status when component mounts
  useEffect(() => {
    if (user && postId) {
      const fetchLikeStatus = async () => {
        try {
          const status = await likeService.getLikeStatus(postId, user.userId);
          setIsLiked(status.isLiked);
          setLikeCount(status.likeCount);
        } catch (error) {
          console.error('Failed to fetch like status:', error);
        }
      };
      
      fetchLikeStatus();
    }
  }, [postId, user]);

  const handleLikeToggle = async (event: React.MouseEvent) => {
    // Prevent event bubbling to parent components (like PostCard)
    event.preventDefault();
    event.stopPropagation();
    
    if (!user || loading || disabled) return;

    setLoading(true);
    try {
      const response = await likeService.toggleLike({
        postId,
        userId: user.userId
      });

      setIsLiked(response.isLiked);
      setLikeCount(response.likeCount);
      
      // Notify parent component of the change
      if (onLikeChange) {
        onLikeChange(response.isLiked, response.likeCount);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium';
    }
  };

  if (!user) {
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        <Tooltip title="Sign in to like posts">
          <span>
            <IconButton size={getButtonSize()} disabled>
              <FavoriteBorder sx={{ fontSize: getIconSize() }} />
            </IconButton>
          </span>
        </Tooltip>
        {showCount && (
          <Typography variant="body2" color="text.secondary">
            {likeCount}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
        <IconButton
          onClick={handleLikeToggle}
          disabled={loading || disabled}
          size={getButtonSize()}
          color={isLiked ? 'error' : 'default'}
          sx={{
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            }
          }}
        >
          {isLiked ? (
            <Favorite sx={{ fontSize: getIconSize() }} />
          ) : (
            <FavoriteBorder sx={{ fontSize: getIconSize() }} />
          )}
        </IconButton>
      </Tooltip>
      {showCount && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontWeight: isLiked ? 600 : 400,
            minWidth: '20px'
          }}
        >
          {likeCount}
        </Typography>
      )}
    </Box>
  );
};

export default LikeButton; 