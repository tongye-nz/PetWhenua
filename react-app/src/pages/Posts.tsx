import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Fab,
  Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Button, Text, LoadingSpinner } from '../components/ui';
import { PostsGrid } from '../components/features/posts';
import { useAuth } from '../contexts/AuthContext';
import { usePost } from '../contexts/PostContext';
import type { Post, PostFilters, PostType } from '../models/post.types';

const Posts: React.FC = () => {
  const { postType: postTypeParam } = useParams<{ postType?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, loading, error, fetchPosts, setFilters, filters, clearError } = usePost();

  // Map URL parameter to PostType
  const getPostTypeFromParam = (param?: string): PostType | undefined => {
    if (!param) return undefined;
    
    const typeMap: { [key: string]: PostType } = {
      'moment': 0, // PostType.Moment
      'buy-sell': 1, // PostType.BuySell  
      'meetup': 2, // PostType.Meetup
      'pet-wedding': 3, // PostType.PetWedding
      'library': 4, // PostType.Library
      'announcement': 5 // PostType.Announcement
    };
    
    return typeMap[param];
  };

  useEffect(() => {
    const postType = getPostTypeFromParam(postTypeParam);
    const initialFilters = postType !== undefined ? { postType } : {};
    setFilters(initialFilters);
    fetchPosts(initialFilters);
  }, [postTypeParam, fetchPosts, setFilters]);

  const handleFilterChange = (newFilters: Partial<PostFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchPosts(updatedFilters);
  };

  const handleCreatePost = () => {
    // Navigate to create post page
    navigate('/create-post');
  };

  const handleEditPost = (post: Post) => {
    // Navigate to edit page (to be implemented later)
    console.log('Edit post:', post.postId);
  };

  const handleDeletePost = async (post: Post) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // The actual delete logic will be handled by PostContext
        console.log('Delete post:', post.postId);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleViewPost = (post: Post) => {
    navigate(`/post/${post.postId}`);
  };

  // Get display name for current post type
  const getPostTypeDisplayName = (postType?: PostType): string => {
    if (postType === undefined) return 'All Posts';
    const typeMap: { [key: number]: string } = {
      0: 'Meetup Posts',
      1: 'Pet Wedding Posts',
      2: 'Buy & Sell Posts', 
      3: 'Library Posts',
      4: 'Announcement Posts',
      5: 'Moment Posts'
    };
    return typeMap[postType] || 'Community Posts';
  };

  const postTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 0, label: 'Meetup' },
    { value: 1, label: 'Pet Wedding' },
    { value: 2, label: 'Buy/Sell' },
    { value: 3, label: 'Library' },
    { value: 4, label: 'Announcement' },
    { value: 5, label: 'Moment' },
  ];

  if (loading && posts.length === 0) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" py={4}>
          <LoadingSpinner />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Text variant="h4" component="h1" fontWeight="bold">
          {getPostTypeDisplayName(filters.postType)}
        </Text>
        {user && (
          <Button 
            variant="primary" 
            onClick={handleCreatePost}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <Add sx={{ mr: 1 }} />
            Create Post
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Text variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
            Filters
          </Text>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
              alignItems: 'end'
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Post Type</InputLabel>
              <Select
                value={filters.postType ?? ''}
                label="Post Type"
                onChange={(e) => {
                  const value = String(e.target.value);
                  handleFilterChange({ 
                    postType: value === '' ? undefined : Number(value) as PostType
                  });
                }}
              >
                {postTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {user && (
              <Button 
                variant={filters.userId === user.userId ? 'primary' : 'outline'}
                onClick={() => handleFilterChange({ 
                  userId: filters.userId === user.userId ? undefined : user.userId 
                })}
                fullWidth
              >
                My Posts
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => handleFilterChange({ postType: undefined, userId: undefined })}
              fullWidth
            >
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {/* Posts Grid */}
      <PostsGrid
        posts={posts}
        onViewPost={handleViewPost}
        onEditPost={user ? handleEditPost : undefined}
        onDeletePost={user ? handleDeletePost : undefined}
        isLoading={loading}
        showActions={!!user}
        emptyMessage={
          filters.postType !== undefined || filters.userId !== undefined
            ? 'No posts found matching your filters'
            : 'No posts found'
        }
      />

      {/* Floating Action Button for Mobile */}
      {user && (
        <Fab
          color="primary"
          aria-label="create post"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' }
          }}
          onClick={handleCreatePost}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default Posts;
