import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Avatar,
  Button,
  Alert,
  Divider
} from '@mui/material';
import { ArrowBack, Edit, Delete, LocationOn, Event, AttachMoney } from '@mui/icons-material';
import { LoadingSpinner } from '../components/ui';
import { usePost } from '../contexts/PostContext';
import { useAuth } from '../contexts/AuthContext';
import type { PostType } from '../models/post.types';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPost, loading, error, fetchPost, deletePost } = usePost();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id));
    }
  }, [id, fetchPost]);

  const getPostTypeLabel = (postType: PostType): string => {
    const typeMap: { [key: number]: string } = {
      0: 'Meetup',
      1: 'Pet Wedding',
      2: 'Buy & Sell',
      3: 'Library',
      4: 'Announcement',
      5: 'Moment'
    };
    return typeMap[postType] || 'Unknown';
  };

  const getPostTypeColor = (postType: PostType): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    const colorMap: { [key: number]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' } = {
      0: 'info',       // Meetup
      1: 'secondary',  // Pet Wedding
      2: 'success',    // Buy & Sell
      3: 'warning',    // Library
      4: 'error',      // Announcement
      5: 'primary'     // Moment
    };
    return colorMap[postType] || 'primary';
  };

  const handleEdit = () => {
    if (currentPost?.postId) {
      // Navigate to edit mode
      navigate(`/edit-post/${currentPost.postId}`);
    }
  };

  const handleDelete = async () => {
    if (!currentPost || !user) return;

    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deletePost(currentPost.postId);
      navigate('/posts', { replace: true });
    } catch (error) {
      console.error('Failed to delete post:', error);
      setIsDeleting(false);
    }
  };

  const canEditOrDelete = user && currentPost && (
    user.userId === currentPost.userId || 
    user.role === 'site_admin' || 
    user.role === 'meetup_admin'
  );

  if (loading && !currentPost) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box py={4}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            startIcon={<ArrowBack />}
            onClick={() => navigate('/posts')}
          >
            Back to Posts
          </Button>
        </Box>
      </Container>
    );
  }

  if (!currentPost) {
    return (
      <Container>
        <Box py={4}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Post not found
          </Alert>
          <Button 
            startIcon={<ArrowBack />}
            onClick={() => navigate('/posts')}
          >
            Back to Posts
          </Button>
        </Box>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/posts')}
          sx={{ mr: 2 }}
        >
          Back to Posts
        </Button>
        
        {canEditOrDelete && (
          <Box ml="auto" display="flex" gap={1}>
            <Button
              startIcon={<Edit />}
              onClick={handleEdit}
              variant="outlined"
              size="small"
            >
              Edit
            </Button>
            <Button
              startIcon={<Delete />}
              onClick={handleDelete}
              variant="outlined"
              color="error"
              size="small"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Post Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Post Type Badge */}
          <Box mb={2}>
            <Chip 
              label={getPostTypeLabel(currentPost.postType)}
              color={getPostTypeColor(currentPost.postType)}
              variant="filled"
              size="small"
            />
          </Box>

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {currentPost.title}
          </Typography>

          {/* Author and Date */}
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar sx={{ mr: 2 }}>
              {currentPost.user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {currentPost.user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Posted {formatDate(currentPost.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Content */}
          <Typography variant="body1" sx={{ mt: 3, lineHeight: 1.7 }}>
            {currentPost.content}
          </Typography>

          {/* Additional Information */}
          <Box mt={4}>
            {currentPost.price && (
              <Box display="flex" alignItems="center" mb={2}>
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography variant="body1" fontWeight="medium">
                  ${currentPost.price.toFixed(2)} NZD
                </Typography>
              </Box>
            )}

            {currentPost.eventDate && (
              <Box display="flex" alignItems="center" mb={2}>
                <Event color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {formatDate(currentPost.eventDate)}
                </Typography>
              </Box>
            )}

            {currentPost.location && (
              <Box display="flex" alignItems="center" mb={2}>
                <LocationOn color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {currentPost.location}
                </Typography>
              </Box>
            )}

            {currentPost.category && (
              <Box mt={3}>
                <Typography variant="body2" color="text.secondary">
                  Category: {currentPost.category}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Images */}
          {currentPost.images && currentPost.images.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Images
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                {currentPost.images.map((image, index) => {
                  // Construct proper image URL
                  const imageUrl = image.startsWith('http') 
                    ? image 
                    : `http://localhost:5295${image.startsWith('/') ? '' : '/'}${image}`;
                  
                  return (
                    <Box
                      key={index}
                      component="img"
                      src={imageUrl}
                      alt={`${currentPost.title} - Image ${index + 1}`}
                      sx={{
                        width: 200,
                        height: 150,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PostDetail;
