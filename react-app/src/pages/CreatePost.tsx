import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PostForm } from '../components/forms';
import { useAuth } from '../contexts/AuthContext';
import type { CreatePostRequest, UpdatePostRequest, Post } from '../models/post.types';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    // Navigate back to the posts page
    navigate('/posts');
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
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default CreatePost;
