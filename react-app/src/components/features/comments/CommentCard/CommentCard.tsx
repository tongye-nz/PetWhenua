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
  TextField,
  Button,
  Chip
} from '@mui/material';
import { MoreVert, Edit, Delete, Save, Cancel, Person } from '@mui/icons-material';
import { useAuth } from '../../../../contexts/AuthContext';
import { commentService } from '../../../../api/comment.api';
import type { Comment } from '../../../../models/comment.types';
import { getProfilePictureUrl } from '../../../../utils/imageUrlUtils';
import { formatTimeAgo } from '../../../../utils/dateUtils';

export interface CommentCardProps {
  comment: Comment;
  onCommentUpdated?: (updatedComment: Comment) => void;
  onCommentDeleted?: (commentId: number) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onCommentUpdated,
  onCommentDeleted
}) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);

  const isOwner = user?.userId === comment.userId;
  const canEdit = isOwner;
  const canDelete = isOwner;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    handleMenuClose();
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleEditSave = async () => {
    if (!user || editContent.trim() === comment.content.trim()) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await commentService.updateComment(comment.commentId, {
        userId: user.userId,
        content: editContent.trim()
      });

      const updatedComment = {
        ...comment,
        content: editContent.trim(),
        updatedAt: new Date().toISOString()
      };

      if (onCommentUpdated) {
        onCommentUpdated(updatedComment);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setLoading(false);
    }
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

  const isEdited = comment.updatedAt !== comment.createdAt;

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
              {isEdited && (
                <Chip 
                  label="edited" 
                  size="small" 
                  variant="outlined" 
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              )}
              
              {/* Actions Menu */}
              {(canEdit || canDelete) && (
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
                    {canEdit && (
                      <MenuItem onClick={handleEditStart}>
                        <Edit fontSize="small" sx={{ mr: 1 }} />
                        Edit
                      </MenuItem>
                    )}
                    {canDelete && (
                      <MenuItem onClick={handleDelete}>
                        <Delete fontSize="small" sx={{ mr: 1 }} />
                        Delete
                      </MenuItem>
                    )}
                  </Menu>
                </Box>
              )}
            </Box>

            {/* Content */}
            {isEditing ? (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  sx={{ mb: 1 }}
                />
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleEditSave}
                    disabled={loading || editContent.trim() === ''}
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleEditCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                {comment.content}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CommentCard; 