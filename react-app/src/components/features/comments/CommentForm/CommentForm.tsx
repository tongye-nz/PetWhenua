import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Alert
} from '@mui/material';
import { Send, Person } from '@mui/icons-material';
import { useAuth } from '../../../../contexts/AuthContext';
import { commentService } from '../../../../api/comment.api';
import type { CommentResponse } from '../../../../models/comment.types';
import { getProfilePictureUrl } from '../../../../utils/imageUrlUtils';

export interface CommentFormProps {
  postId: number;
  onCommentAdded?: (comment: CommentResponse) => void;
  placeholder?: string;
  maxLength?: number;
}

const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  onCommentAdded,
  placeholder = "Write a comment...",
  maxLength = 1000
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be signed in to comment.');
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Comment cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newComment = await commentService.createComment({
        postId,
        userId: user.userId,
        content: trimmedContent
      });

      if (onCommentAdded) {
        onCommentAdded(newComment);
      }

      setContent(''); // Clear the form
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      setError(error.response?.data?.message || 'Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const getDisplayName = () => {
    if (!user) return '';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  if (!user) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Please sign in to leave a comment.
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box display="flex" gap={2}>
        {/* User Avatar */}
        <Avatar
          src={getProfilePictureUrl(user.profilePicture)}
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'primary.main',
            fontSize: '1rem',
            mr: 1.5
          }}
        >
          {!user.profilePicture && (user.username ? user.username.charAt(0).toUpperCase() : <Person />)}
        </Avatar>

        {/* Comment Input */}
        <Box flex={1}>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            variant="outlined"
            size="small"
            disabled={loading}
            inputProps={{ maxLength }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              }
            }}
          />
          
          {/* Character count and submit button */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mt={1}
          >
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ opacity: content.length > maxLength * 0.8 ? 1 : 0.6 }}
            >
              {content.length}/{maxLength}
            </Typography>
            
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={loading || !content.trim() || content.length > maxLength}
              startIcon={<Send />}
              sx={{ ml: 1 }}
            >
              {loading ? 'Posting...' : 'Comment'}
            </Button>
          </Box>
          
          {/* Helper text */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Press Ctrl+Enter to submit quickly
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CommentForm; 