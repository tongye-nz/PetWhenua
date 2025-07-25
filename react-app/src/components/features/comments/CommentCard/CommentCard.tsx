import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { MoreVert, Delete, Person } from '@mui/icons-material';
import { useAuth } from '../../../../contexts/AuthContext';
import { commentService } from '../../../../api/comment.api';
import type { Comment } from '../../../../models/comment.types';
import { getProfilePictureUrl } from '../../../../utils/imageUrlUtils';
import { formatTimeAgo } from '../../../../utils/dateUtils';

export interface CommentCardProps {
  comment: Comment;
  onCommentDeleted?: (commentId: number) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onCommentDeleted
}) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  const isOwner = user?.userId === comment.userId;
  const canDelete = isOwner;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (!user) return;

    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (!confirmed) return;

    setLoading(true);
    try {
      await commentService.deleteComment(comment.commentId, user.userId);
      
      if (onCommentDeleted) {
        onCommentDeleted(comment.commentId);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setLoading(false);
    }
    
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    return formatTimeAgo(dateString);
  };

  const getDisplayName = () => {
    if (comment.user.firstName && comment.user.lastName) {
      return `${comment.user.firstName} ${comment.user.lastName}`;
    }
    return comment.user.username;
  };

  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" gap={2}>
          {/* User Avatar */}
          <Avatar
            src={getProfilePictureUrl(comment.user.profilePicture)}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '1rem',
              mr: 1.5
            }}
          >
            {!comment.user.profilePicture && (comment.user.username ? comment.user.username.charAt(0).toUpperCase() : <Person />)}
          </Avatar>

          {/* Comment Content */}
          <Box flex={1}>
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="body2" fontWeight="medium">
                {getDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
              </Typography>
              
              {/* Actions Menu */}
              {canDelete && (
                <Box ml="auto">
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    disabled={loading}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleDelete}>
                      <Delete fontSize="small" sx={{ mr: 1 }} />
                      Delete
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>

            {/* Content */}
            <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
              {comment.content}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CommentCard; 