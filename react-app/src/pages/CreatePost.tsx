import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Box, Typography, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PostForm } from '../components/forms';
import { useAuth } from '../contexts/AuthContext';
import type { CreatePostRequest, UpdatePostRequest, Post, PostType } from '../models/post.types';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const postTypeParam = searchParams.get('type');

  // Map URL parameter to PostType
  const getPostTypeFromParam = (param: string | null): PostType | undefined => {
    if (!param) return undefined;
    
    const typeMap: { [key: string]: PostType } = {
      'moment': 0,
      'buy-sell': 1,
      'meetup': 2,
      'pet-wedding': 3,
      'library': 4,
      'announcement': 5
    };
    
    return typeMap[param];
  };

  const preselectedPostType = getPostTypeFromParam(postTypeParam);

  const handleFormSubmit = async (_: CreatePostRequest | UpdatePostRequest, createdPost?: Post) => {
    // If a post was created, navigate to its detail page
    if (createdPost) {
      navigate(`/post/${createdPost.postId}`);
    } else {
      // Fallback to posts page
      navigate('/posts');
    }
  };

  const handleCancel = () => {
    // Navigate back to the posts page or the specific post type page
    if (postTypeParam) {
      navigate(`/posts/${postTypeParam}`);
    } else {
      navigate('/posts');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>
            Please sign in to create a post
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box display="flex" alignItems="center" mb={4}>
        <Button 
          startIcon={<ArrowBack />}
          onClick={handleCancel}
          sx={{ mr: 2 }}
        >
          Back to Posts
        </Button>
        
        <Typography variant="h4" component="h1" fontWeight="bold">
          Create New Post
        </Typography>
      </Box>

      {/* Post Creation Form */}
      <PostForm
        mode="create"
        initialData={preselectedPostType !== undefined ? { postType: preselectedPostType } : undefined}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default CreatePost;
