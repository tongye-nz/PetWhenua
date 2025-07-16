import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Typography, Button, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { PostForm } from '../components/forms';
import { LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { usePost } from '../contexts/PostContext';
import type { CreatePostRequest, UpdatePostRequest, Post } from '../models/post.types';
import type { PostFormData } from '../components/forms/PostForm/PostForm';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { currentPost, fetchPost, updatePost } = usePost();
  
  const [initialData, setInitialData] = useState<Partial<PostFormData> | undefined>(undefined);
  const [loadingPost, setLoadingPost] = useState(false);
  const [fetchError, setFetchError] = useState<string>('');

  const isEditMode = !!id;

  // Fetch post data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadPost = async () => {
        try {
          setLoadingPost(true);
          setFetchError('');
          await fetchPost(parseInt(id));
        } catch (error) {
          console.error('Failed to fetch post for editing:', error);
          setFetchError('Failed to load post data. Please try again.');
        } finally {
          setLoadingPost(false);
        }
      };
      
      loadPost();
    }
  }, [isEditMode, id, fetchPost]);

  // Set initial form data when post is loaded
  useEffect(() => {
    if (isEditMode && currentPost && currentPost.postId === parseInt(id!)) {
      setInitialData({
        title: currentPost.title,
        content: currentPost.content,
        images: currentPost.images || [],
        location: currentPost.location,
        address: currentPost.address,
        price: currentPost.price,
        eventDate: currentPost.eventDate,
        category: currentPost.category,
        postType: currentPost.postType,
        selectedPetIds: [], // TODO: Add pet IDs if available in post data
      });
    }
  }, [currentPost, isEditMode, id]);

  const handleFormSubmit = async (data: CreatePostRequest | UpdatePostRequest, createdPost?: Post) => {
    try {
      if (isEditMode && id) {
        // Handle update
        await updatePost(parseInt(id), data as UpdatePostRequest);
        navigate(`/post/${id}`);
      } else {
        // Handle create - if a post was created, navigate to its detail page
        if (createdPost) {
          navigate(`/post/${createdPost.postId}`);
        } else {
          // Fallback to posts page
          navigate('/posts');
        }
      }
    } catch (error) {
      console.error('Failed to submit post:', error);
      // Error will be handled by the PostForm component
    }
  };

  const handleCancel = () => {
    if (isEditMode && id) {
      // Navigate back to the post detail page
      navigate(`/post/${id}`);
    } else {
      // Navigate back to the posts page
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

  // Show loading while fetching post data in edit mode
  if (loadingPost || (isEditMode && !initialData && !fetchError)) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <LoadingSpinner />
        </Box>
      </Container>
    );
  }

  // Show error if failed to fetch post data
  if (fetchError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center">
          <Alert severity="error" sx={{ mb: 2 }}>
            {fetchError}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/posts')}
            sx={{ mt: 2 }}
          >
            Back to Posts
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
          {isEditMode ? 'Edit Post' : 'Create New Post'}
        </Typography>
      </Box>

      {/* Post Form */}
      <PostForm
        mode={isEditMode ? "edit" : "create"}
        initialData={initialData}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default CreatePost;
