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
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import { ArrowBack, Edit, Delete, LocationOn, Event, AttachMoney, AdminPanelSettings } from '@mui/icons-material';
import { LoadingSpinner, LikeButton } from '../components/ui';
import { CommentSection } from '../components/features/comments';
import { usePost } from '../contexts/PostContext';
import { useAuth } from '../contexts/AuthContext';
import { postService } from '../api';
import type { PostType, PostStatus, PostEditPermissions, PostDeletePermissions, PostModerationPermissions } from '../models/post.types';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPost, loading, error, fetchPost, deletePost } = usePost();
  const [isDeleting, setIsDeleting] = useState(false);
  const [editPermissions, setEditPermissions] = useState<PostEditPermissions | null>(null);
  const [deletePermissions, setDeletePermissions] = useState<PostDeletePermissions | null>(null);
  const [moderationPermissions, setModerationPermissions] = useState<PostModerationPermissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id));
    }
  }, [id, fetchPost]);

  // Load permissions when post is loaded
  useEffect(() => {
    if (currentPost && user) {
      loadPermissions();
    }
  }, [currentPost, user]);

  const loadPermissions = async () => {
    if (!currentPost || !user?.userId || !user?.role) return;

    setPermissionsLoading(true);
    try {
      const [editPerms, deletePerms, moderationPerms] = await Promise.all([
        postService.getEditPermissions(currentPost.postId, user.userId, user.role),
        postService.getDeletePermissions(currentPost.postId, user.userId, user.role),
        postService.getModerationPermissions(currentPost.postId, user.userId, user.role)
      ]);

      setEditPermissions(editPerms);
      setDeletePermissions(deletePerms);
      setModerationPermissions(moderationPerms);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setPermissionsLoading(false);
    }
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
    if (currentPost?.postId && editPermissions?.canEdit) {
      navigate(`/edit-post/${currentPost.postId}`);
    }
  };

  const handleDelete = async () => {
    if (!currentPost || !user || !deletePermissions?.canDelete) return;

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

  const handleStatusOnlyChange = async () => {
    if (!currentPost || !user?.userId || !user?.role || !moderationPermissions?.canChangeStatus) return;

    // For demo purposes, toggle between Active and Inactive
    // In a real app, you might want a proper status selection dialog
    const newStatus = currentPost.status === 0 ? 3 : 0; // Active: 0, Inactive: 3
    const statusName = newStatus === 0 ? 'Active' : 'Inactive';
    const confirmed = window.confirm(`Change post status to ${statusName}?`);
    
    if (!confirmed) return;

    try {
      setIsChangingStatus(true);
      await postService.changePostStatusOnly(currentPost.postId, newStatus, user.userId, user.role);
      // Refresh the post to get updated status
      await fetchPost(currentPost.postId);
      // Reload permissions as they might have changed
      await loadPermissions();
    } catch (error) {
      console.error('Failed to change post status:', error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getStatusLabel = (status: PostStatus): string => {
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

  const getStatusColor = (status: PostStatus): 'success' | 'info' | 'warning' | 'default' | 'error' => {
    const colorMap: { [key: number]: 'success' | 'info' | 'warning' | 'default' | 'error' } = {
      0: 'success',   // Active
      1: 'info',      // Sold
      2: 'warning',   // Expired
      3: 'default',   // Inactive
      4: 'error',     // Cancelled
      5: 'warning'    // Pending
    };
    return colorMap[status] || 'default';
  };

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

  // Show action buttons if user is logged in and permissions are loaded
  const showActionButtons = user && !permissionsLoading && (editPermissions || deletePermissions || moderationPermissions);

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
        
        {showActionButtons && (
          <Box ml="auto" display="flex" gap={1}>
            {/* Edit Button */}
            {editPermissions && (
              <Tooltip 
                title={editPermissions.canEdit ? '' : editPermissions.reason}
                placement="top"
              >
                <span>
                  <Button
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    variant="outlined"
                    size="small"
                    disabled={!editPermissions.canEdit}
                  >
                    Edit
                  </Button>
                </span>
              </Tooltip>
            )}

            {/* Status-Only Change Button (for Meetup Admins) */}
            {moderationPermissions?.canChangeStatus && (
              <Tooltip title="Change post status (Meetup Admin)" placement="top">
                <IconButton
                  onClick={handleStatusOnlyChange}
                  color="primary"
                  size="small"
                  disabled={isChangingStatus}
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1
                  }}
                >
                  <AdminPanelSettings fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Delete Button */}
            {deletePermissions && (
              <Tooltip 
                title={deletePermissions.canDelete ? '' : deletePermissions.reason}
                placement="top"
              >
                <span>
                  <Button
                    startIcon={<Delete />}
                    onClick={handleDelete}
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={!deletePermissions.canDelete || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {/* Post Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Post Type Badge and Status */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Chip 
              label={getPostTypeLabel(currentPost.postType)}
              color={getPostTypeColor(currentPost.postType)}
              variant="filled"
              size="small"
            />
            <Chip 
              label={getStatusLabel(currentPost.status)}
              color={getStatusColor(currentPost.status)}
              variant="outlined"
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
