import React from 'react';
import { Box, Typography } from '@mui/material';
import { PostCard } from '../';
import { LoadingSpinner } from '../../../ui';
import type { Post } from '../../../../models/post.types';

export interface PostsGridProps {
  posts: Post[];
  onViewPost?: (post: Post) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  isLoading?: boolean;
  showActions?: boolean;
  compact?: boolean;
  emptyMessage?: string;
}

const PostsGrid: React.FC<PostsGridProps> = ({
  posts,
  onViewPost,
  onEditPost,
  onDeletePost,
  isLoading = false,
  showActions = true,
  compact = false,
  emptyMessage = 'No posts found'
}) => {
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 200 
        }}
      >
        <LoadingSpinner />
      </Box>
    );
  }

  if (posts.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 200,
          textAlign: 'center',
          py: 4
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {showActions ? 'Create your first post to get started!' : 'Check back later for new posts.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: compact ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
          lg: compact ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'
        },
        gap: 3
      }}
    >
      {posts.map((post) => (
        <PostCard
          key={post.postId}
          post={post}
          onView={onViewPost}
          onEdit={onEditPost}
          onDelete={onDeletePost}
          showActions={showActions}
          compact={compact}
        />
      ))}
    </Box>
  );
};

export default PostsGrid;
