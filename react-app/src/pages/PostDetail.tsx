import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Event,
  Edit,
  Person,
  Delete,
  AttachMoney
} from '@mui/icons-material';
import { postService } from '../api/post.api';
import { PostType, PostStatus } from '../models/post.types';
import type { Post } from '../models/post.types';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/dateUtils';
import { StatusChip } from '../components/ui';
import { CommentSection } from '../components/features/comments';
import PostImageGallery from '../components/PostImageGallery';
import { getProfilePictureUrl } from '../utils/imageUrlUtils';
import { LoadingSpinner, LikeButton, FollowButton } from '../components/ui';
import { usePost } from '../contexts/PostContext';
import { userFollowService } from '../api/userFollow.api';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPost, loading, error, fetchPost, deletePost } = usePost();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatusLoaded, setFollowStatusLoaded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id));
    }
  }, [id, fetchPost]);

  // Load follow status for the post author
  useEffect(() => {
    const loadFollowStatus = async () => {
      if (!user?.userId || !currentPost?.user?.userId || user.userId === currentPost.userId) {
        setFollowStatusLoaded(true);
        return;
      }

      try {
        const status = await userFollowService.isFollowing(currentPost.user.userId);
        setIsFollowing(status);
      } catch (error) {
        console.debug('Failed to load follow status:', error);
      } finally {
        setFollowStatusLoaded(true);
      }
    };

    if (currentPost) {
      loadFollowStatus();
    }
  }, [currentPost?.user?.userId, user?.userId]);

  // Handle follow status change
  const handleFollowChange = (newFollowStatus: boolean) => {
    setIsFollowing(newFollowStatus);
  };

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



  const getStatusLabel = (status: number): string => {
    const statusMap: { [key: number]: string } = {
      0: 'Active',
      1: 'Sold',
      2: 'Expired',
      3: 'Inactive',
      4: 'Cancelled',
      5: 'Pending'
    };
    return statusMap[status] || 'Unknown';
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

  const handleProfilePictureClick = (event: React.MouseEvent) => {
    // Prevent event bubbling to parent components
    event.preventDefault();
    event.stopPropagation();
    
    if (!currentPost?.user?.userId) return;
    
    // Navigate to appropriate profile page
    if (user?.userId === currentPost.user.userId) {
      // Current user's profile
      navigate('/profile');
    } else {
      // Other user's profile
      navigate(`/user/${currentPost.user.userId}`);
    }
  };

  // Only post authors can edit or delete their own posts
  const isOwner = user && currentPost && user.userId === currentPost.userId;
  
  // Users can edit their own posts only if status is Active, Inactive, or Pending
  // Cannot edit if status is Sold, Expired, or Cancelled
  const canEdit = isOwner && (
    currentPost.status === PostStatus.Active || 
    currentPost.status === PostStatus.Inactive || 
    currentPost.status === PostStatus.Pending
  );
  
  // Users can always delete their own posts regardless of status
  const canDelete = isOwner;

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
        
        {(canEdit || canDelete) && (
          <Box ml="auto" display="flex" gap={1}>
            {canEdit && (
              <Button
                startIcon={<Edit />}
                onClick={handleEdit}
                variant="outlined"
                size="small"
              >
                Edit
              </Button>
            )}
            {canDelete && (
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
            )}
          </Box>
        )}
      </Box>

      {/* Post Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Post Type and Status Badges */}
          <Box mb={2} display="flex" gap={1} flexWrap="wrap">
            <StatusChip 
              statusVariant="type"
              postType={currentPost.postType}
              label={getPostTypeLabel(currentPost.postType)}
              size="small"
            />
            <StatusChip 
              statusVariant="status"
              status={currentPost.status}
              label={getStatusLabel(currentPost.status)}
              size="small"
            />
          </Box>

          {/* Title */}
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {currentPost.title}
          </Typography>

          {/* Author and Date */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <Avatar 
                src={getProfilePictureUrl(currentPost.user?.profilePicture)}
                sx={{ 
                  mr: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
                onClick={handleProfilePictureClick}
              >
                {!currentPost.user?.profilePicture && currentPost.user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {currentPost.user?.firstName && currentPost.user?.lastName 
                    ? `${currentPost.user.firstName} ${currentPost.user.lastName}` 
                    : currentPost.user?.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Posted {formatDate(currentPost.createdAt)}
                </Typography>
              </Box>
            </Box>
            
            {/* Follow button - only show for authenticated users viewing other users' posts */}
            {user && !isOwner && currentPost.user && (
              <>
                {followStatusLoaded && (
                  <FollowButton
                    userId={currentPost.user.userId}
                    isFollowing={isFollowing}
                    onFollowChange={handleFollowChange}
                    size="medium"
                    variant="outlined"
                  />
                )}
              </>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Content */}
          <Typography variant="body1" sx={{ mt: 3, lineHeight: 1.7 }}>
            {currentPost.content}
          </Typography>

          {/* Pet Wedding Participants - show the two pets */}
          {currentPost.postType === 1 && currentPost.petWeddingParticipants && currentPost.petWeddingParticipants.length === 2 && (
            <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                💍 Pet Wedding Participants
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                {currentPost.petWeddingParticipants.map((participant) => (
                  <Box key={participant.participantId} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    p: 2,
                    minWidth: 250,
                    boxShadow: 1
                  }}>
                    {/* Pet Profile Picture */}
                    <Avatar
                      src={(() => {
                        const profilePic = participant.pet?.profilePicture;
                        if (!profilePic) return undefined;
                        
                        // If it's already a full URL, use it directly
                        if (profilePic.startsWith('http')) return profilePic;
                        
                        // If it's a data URL (base64), use it directly 
                        if (profilePic.startsWith('data:')) {
                          return profilePic;
                        }
                        
                        // If it's a file path, construct the full URL
                        if (profilePic.length < 500) {
                          return `http://localhost:5295${profilePic.startsWith('/') ? '' : '/'}${profilePic}`;
                        }
                        
                        return undefined;
                      })()}
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: 'primary.light',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}
                    >
                      {participant.pet?.name?.charAt(0).toUpperCase() || '🐾'}
                    </Avatar>
                    
                    {/* Pet Info */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {participant.pet?.name || 'Unknown Pet'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {participant.pet?.gender && (
                          <span>
                            {participant.pet.gender === 'Male' || participant.pet.gender === 'M' ? '♂️ Male' : 
                             participant.pet.gender === 'Female' || participant.pet.gender === 'F' ? '♀️ Female' : participant.pet.gender}
                          </span>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        <strong>Species:</strong> {participant.pet?.species || 'Unknown'}
                      </Typography>
                      {participant.pet?.breed && (
                        <Typography variant="body2" color="text.primary">
                          <strong>Breed:</strong> {participant.pet.breed}
                        </Typography>
                      )}
                      {participant.pet?.age && (
                        <Typography variant="body2" color="text.primary">
                          <strong>Age:</strong> {participant.pet.age} years old
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

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

            {/* Address - for Meetup and Pet Wedding posts */}
            {currentPost.address && (currentPost.postType === 0 || currentPost.postType === 1) && (
              <Box display="flex" alignItems="center" mb={2}>
                <LocationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1" fontWeight="medium">
                  Address: {currentPost.address}
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

          <Divider sx={{ my: 3 }} />

          {/* Like and Comment Actions */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <LikeButton postId={currentPost.postId} size="medium" />
          </Box>
        </CardContent>

        {/* Comment Section */}
        <CommentSection postId={currentPost.postId} />
      </Card>
    </Container>
  );
};

export default PostDetail;
