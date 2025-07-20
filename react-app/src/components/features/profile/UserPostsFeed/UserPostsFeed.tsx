import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Alert
} from '@mui/material';
import { Article, PhotoCamera } from '@mui/icons-material';
import { postService } from '../../../../api/post.api';
import { PostTypeUtils, type Post } from '../../../../models/post.types';
import { PostCard } from '../../../features/posts';
import { LoadingSpinner } from '../../../ui';
import { useNavigate } from 'react-router-dom';

export interface UserPostsFeedProps {
  userId: number;
  isOwnProfile: boolean;
  maxPosts?: number;
}

const UserPostsFeed: React.FC<UserPostsFeedProps> = ({
  userId,
  isOwnProfile,
  maxPosts = 20
}) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Memoize the loadUserPosts function to prevent recreation on every render
  const loadUserPosts = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError('');

    try {
      // Load user's posts - filter for 'moment' type posts
      const userPosts = await postService.getUserPosts(userId);
      const momentPosts = userPosts.filter((post: Post) => PostTypeUtils.isMoment(post.postType));
      
      // Sort by creation date (newest first) and limit results
      const sortedPosts = momentPosts
        .sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, maxPosts);
      
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading user posts:', error);
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [userId, maxPosts]); // Include all dependencies that the function uses

  // Use the memoized function in useEffect
  useEffect(() => {
    loadUserPosts();
  }, [loadUserPosts]); // Now we can safely include the memoized function

  const handleViewPost = (post: Post) => {
    navigate(`/post/${post.postId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 4,
        p: 3,
        boxShadow: (theme) => 
          theme.palette.mode === 'light' 
            ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
            : '0 4px 20px rgba(0, 0, 0, 0.3)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 3,
          fontWeight: 600,
          fontSize: '1.2rem'
        }}>
          <Article sx={{ color: 'primary.main' }} /> 
          {isOwnProfile ? 'My Moments' : 'Moments'}
        </Typography>
        
        <Box display="flex" justifyContent="center" py={4}>
          <LoadingSpinner />
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 4,
        p: 3,
        boxShadow: (theme) => 
          theme.palette.mode === 'light' 
            ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
            : '0 4px 20px rgba(0, 0, 0, 0.3)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 3,
          fontWeight: 600,
          fontSize: '1.2rem'
        }}>
          <Article sx={{ color: 'primary.main' }} /> 
          {isOwnProfile ? 'My Moments' : 'Moments'}
        </Typography>
        
        <Alert severity="error" sx={{ 
          mb: 2,
          borderRadius: '12px'
        }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 4,
        p: 3,
        boxShadow: (theme) => 
          theme.palette.mode === 'light' 
            ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
            : '0 4px 20px rgba(0, 0, 0, 0.3)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 3,
          fontWeight: 600,
          fontSize: '1.2rem'
        }}>
          <Article sx={{ color: 'primary.main' }} /> 
          {isOwnProfile ? 'My Moments' : 'Moments'}
        </Typography>
        
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover'
        }}>
          <PhotoCamera sx={{ 
            fontSize: 64, 
            color: 'primary.main', 
            mb: 2,
            opacity: 0.7
          }} />
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{
            fontWeight: 600
          }}>
            {isOwnProfile ? 'No moments yet' : 'No moments to show'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{
            maxWidth: '300px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {isOwnProfile 
              ? 'Share your first moment to get started!' 
              : 'This user hasn\'t shared any moments yet.'
            }
          </Typography>
        </Box>
      </Box>
    );
  }

  // Posts display using PostCard component
  return (
    <Box sx={{ 
      bgcolor: 'background.paper',
      borderRadius: 4,
      p: 3,
      boxShadow: (theme) => 
        theme.palette.mode === 'light' 
          ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
          : '0 4px 20px rgba(0, 0, 0, 0.3)',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        mb: 3,
        fontWeight: 600,
        fontSize: '1.2rem'
      }}>
        <Article sx={{ color: 'primary.main' }} /> 
        {isOwnProfile ? 'My Moments' : 'Moments'} ({posts.length})
      </Typography>
      
      {/* Use the same PostCard grid layout as MyPosts */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 3,
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {posts.map((post) => (
          <PostCard
            key={post.postId}
            post={post}
            onView={handleViewPost}
            onEdit={isOwnProfile ? undefined : undefined} // No edit in profile view
            onDelete={isOwnProfile ? undefined : undefined} // No delete in profile view
            showActions={false} // Don't show action buttons in profile
            compact={false}
          />
        ))}
      </Box>
      
      {posts.length === maxPosts && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
          Showing first {maxPosts} moments
        </Typography>
      )}
    </Box>
  );
};

export default UserPostsFeed;
