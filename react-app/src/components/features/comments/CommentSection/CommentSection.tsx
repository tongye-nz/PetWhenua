import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Collapse,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { ExpandMore, ExpandLess, ChatBubbleOutline } from '@mui/icons-material';
import CommentCard from '../CommentCard';
import CommentForm from '../CommentForm';
import { commentService } from '../../../../api/comment.api';
import type { Comment, CommentResponse } from '../../../../models/comment.types';

export interface CommentSectionProps {
  postId: number;
  initialCommentCount?: number;
  showFormByDefault?: boolean;
  maxHeight?: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  initialCommentCount = 0,
  showFormByDefault = false,
  maxHeight = 600
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(showFormByDefault);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);

  // Load comments when section is expanded for the first time
  useEffect(() => {
    if (isExpanded && !hasLoadedComments) {
      loadComments();
    }
  }, [isExpanded, hasLoadedComments]);

  const loadComments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const fetchedComments = await commentService.getPostComments(postId);
      setComments(fetchedComments);
      setCommentCount(fetchedComments.length);
      setHasLoadedComments(true);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment: CommentResponse) => {
    // Convert CommentResponse to Comment by ensuring it has the user object
    const comment: Comment = {
      ...newComment,
      user: newComment.user
    };
    
    setComments(prev => [...prev, comment]);
    setCommentCount(prev => prev + 1);
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prev => 
      prev.map(comment => 
        comment.commentId === updatedComment.commentId 
          ? updatedComment 
          : comment
      )
    );
  };

  const handleCommentDeleted = (commentId: number) => {
    setComments(prev => prev.filter(comment => comment.commentId !== commentId));
    setCommentCount(prev => Math.max(0, prev - 1));
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRefresh = () => {
    loadComments();
  };

  return (
    <Paper variant="outlined" sx={{ mt: 2 }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
        onClick={handleToggleExpand}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <ChatBubbleOutline fontSize="small" />
          <Typography variant="h6" component="h3">
            Comments
          </Typography>
          {commentCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              ({commentCount})
            </Typography>
          )}
        </Box>
        
        <Button
          endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
          size="small"
          variant="text"
        >
          {isExpanded ? 'Hide' : 'Show'} Comments
        </Button>
      </Box>

      {/* Expandable Content */}
      <Collapse in={isExpanded}>
        <Divider />
        
        {/* Comment Form */}
        <CommentForm
          postId={postId}
          onCommentAdded={handleCommentAdded}
        />
        
        <Divider />

        {/* Comments List */}
        <Box sx={{ p: 2 }}>
          {loading && !hasLoadedComments ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={handleRefresh}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          ) : comments.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                No comments yet. Be the first to comment!
              </Typography>
            </Box>
          ) : (
            <Box 
              sx={{ 
                maxHeight: maxHeight,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  },
                },
              }}
            >
              {comments.map((comment) => (
                <CommentCard
                  key={comment.commentId}
                  comment={comment}
                  onCommentUpdated={handleCommentUpdated}
                  onCommentDeleted={handleCommentDeleted}
                />
              ))}
              
              {/* Loading indicator for additional operations */}
              {loading && hasLoadedComments && (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={20} />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CommentSection; 