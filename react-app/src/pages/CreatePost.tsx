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
import type { UploadedImage } from '../components/ImageUpload';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { currentPost, fetchPost, updatePost } = usePost();
  
  const [initialData, setInitialData] = useState<Partial<PostFormData> | undefined>(undefined);
  const [initialImages, setInitialImages] = useState<UploadedImage[]>([]);
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
      // Convert existing image URLs to UploadedImage objects
      const existingImages = (currentPost.images || []).map((imageUrl, index) => {
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `http://localhost:5295${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        
        return {
          id: `existing_${index}_${Date.now()}`,
          preview: fullImageUrl,
          size: 0, // Unknown size for existing images
          uploaded: true,
          isExisting: true,
          originalUrl: imageUrl,
        };
      });

             setInitialImages(existingImages);
      
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
        selectedPetIds: currentPost.petWeddingParticipants?.map(p => p.petId) || [], // Extract pet IDs from participants
        status: currentPost.status,
        createdAt: currentPost.createdAt,
      });
    }
  }, [currentPost, isEditMode, id]);

  const handleFormSubmit = async (data: CreatePostRequest | UpdatePostRequest, createdPost?: Post) => {
    try {
      if (isEditMode && id && currentPost) {
        // Handle update - merge with existing post data, ensuring all required fields are present
        // Only include core Post properties, exclude navigation properties
        const fullPostData = {
          postId: parseInt(id),
          userId: currentPost.userId,
          postType: currentPost.postType, // Keep original post type
          title: data.title ?? currentPost.title,
          content: data.content ?? currentPost.content,
          status: currentPost.status,
          images: data.images ?? currentPost.images,
          location: data.location ?? currentPost.location,
          address: data.address ?? currentPost.address,
          price: data.price ?? currentPost.price,
          eventDate: data.eventDate ?? currentPost.eventDate,
          category: data.category ?? currentPost.category,
          createdAt: currentPost.createdAt,
          updatedAt: currentPost.updatedAt,
          user: currentPost.user, // Include user object for backend validation
        };
        console.log('Updating post with data:', fullPostData);
        await updatePost(parseInt(id), fullPostData);
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
    } catch (error: any) {
      console.error('Failed to submit post:', error);
      console.error('Error response:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      // Log specific validation error messages
      if (error.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach(field => {
          console.error(`${field} validation error:`, error.response.data.errors[field]);
        });
      }
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
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
        postId={isEditMode ? parseInt(id!) : undefined}
        initialData={initialData}
        initialImages={initialImages}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default CreatePost;
