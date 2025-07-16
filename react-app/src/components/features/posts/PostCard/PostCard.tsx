import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Box, Avatar, IconButton, Tooltip } from '@mui/material';
import { MoreVert, Edit, Delete, Person, ChatBubbleOutline, LocationOn, Event } from '@mui/icons-material';
import { Text, StatusChip, FollowButton, LikeButton } from '../../../ui';
import { commentService, postService } from '../../../../api';
import PostImageGallery from '../../../PostImageGallery';
import type { Post, PostEditPermissions, PostDeletePermissions } from '../../../../models/post.types';
import { useAuth } from '../../../../contexts/AuthContext';
import { formatDate } from '../../../../utils/dateUtils';

export interface PostCardProps {
  post: Post;
  onView?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  showActions?: boolean;
  compact?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [editPermissions, setEditPermissions] = useState<PostEditPermissions | null>(null);
  const [deletePermissions, setDeletePermissions] = useState<PostDeletePermissions | null>(null);
  
  const isOwner = user?.userId === post.userId;
  const canEdit = editPermissions?.canEdit ?? false;
  const canDelete = deletePermissions?.canDelete ?? false;
  const hasActions = showActions && (canEdit || canDelete || editPermissions || deletePermissions);

  // Load comment count for engagement display
  useEffect(() => {
    const loadCommentCount = async () => {
      try {
        const count = await commentService.getCommentCount(post.postId);
        setCommentCount(count);
      } catch (error) {
        // Silently fail - comment count is not critical
        console.debug('Failed to load comment count:', error);
      }
    };

    loadCommentCount();
  }, [post.postId]);

  // Load edit permissions
  useEffect(() => {
    const loadEditPermissions = async () => {
      if (!user?.userId || !user?.role) return;
      
      try {
        const permissions = await postService.getEditPermissions(post.postId, user.userId, user.role);
        setEditPermissions(permissions);
      } catch (error) {
        console.debug('Failed to load edit permissions:', error);
        // Fallback to basic logic
        setEditPermissions({
          canEdit: false,
          reason: 'Unable to check edit permissions',
          editableStatuses: [0, 3, 5], // Active, Inactive, Pending
          isOwner: user.userId === post.userId,
          isAdmin: user.role === 'site_admin',
          currentStatus: post.status
        });
      }
    };

    loadEditPermissions();
  }, [post.postId, post.userId, post.status, user?.userId, user?.role]);

  // Load delete permissions
  useEffect(() => {
    const loadDeletePermissions = async () => {
      if (!user?.userId || !user?.role) return;
      
      try {
        const permissions = await postService.getDeletePermissions(post.postId, user.userId, user.role);
        setDeletePermissions(permissions);
      } catch (error) {
        console.debug('Failed to load delete permissions:', error);
        // Fallback to basic logic
        setDeletePermissions({
          canDelete: false,
          reason: 'Unable to check delete permissions',
          isOwner: user.userId === post.userId,
          isAdmin: user.role === 'site_admin',
          postType: post.postType,
          adminDeletionAllowed: false
        });
      }
    };

    loadDeletePermissions();
  }, [post.postId, post.userId, post.postType, user?.userId, user?.role]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    if (onView) {
      onView(post);
    }
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) {
      onEdit(post);
    }
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) {
      onDelete(post);
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getStatusLabel = (status: number) => {
    const labels = ['Active', 'Sold', 'Expired', 'Inactive', 'Cancelled'];
    return labels[status] || 'Unknown';
  };

  const getTypeLabel = (type: number) => {
    const labels = ['Meetup', 'Pet Wedding', 'Buy/Sell', 'Library', 'Announcement', 'Moment'];
    return labels[type] || 'Unknown';
  };

  return (
    <Card 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        cursor: onView ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        position: 'relative',
        minHeight: compact ? 280 : 350,
        '&:hover': {
          transform: onView ? 'translateY(-4px)' : 'none',
          boxShadow: onView ? 3 : 1,
        }
      }}
      onClick={handleCardClick}
    >
      {/* Header with user info and actions */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {post.user?.username ? post.user.username.charAt(0).toUpperCase() : <Person />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Text variant="body2" fontWeight="medium">
              {post.user?.username || 'Unknown User'}
            </Text>
            <Text variant="caption" color="text.secondary">
              {formatDate(post.createdAt)}
            </Text>
          </Box>
          
          {/* Follow button - only show for other users' posts */}
          {!isOwner && post.user && (
            <FollowButton
              userId={post.user.userId}
              isFollowing={false} // TODO: Get actual follow status
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {hasActions && (
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{ color: 'text.secondary' }}
          >
            <MoreVert />
          </IconButton>
        )}
      </Box>

      {/* Post content */}
      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <Text variant="h6" gutterBottom>
          {post.title}
        </Text>
        
        <Text 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 3 : 4,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {truncateContent(post.content, compact ? 100 : 200)}
        </Text>

        {/* Pet Wedding Participants - show the two pets */}
        {post.postType === 1 && post.petWeddingParticipants && post.petWeddingParticipants.length === 2 && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Text variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              💍 Pet Wedding Participants
            </Text>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              {post.petWeddingParticipants.map((participant) => (
                <Box key={participant.participantId} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  p: 0.5,
                  flex: 1,
                  minWidth: 0 // Allow content to shrink
                }}>
                  {/* Pet Profile Picture */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {participant.pet?.profilePicture ? (
                      <Box
                        component="img"
                        src={participant.pet.profilePicture.startsWith('http') 
                          ? participant.pet.profilePicture 
                          : `http://localhost:5295${participant.pet.profilePicture.startsWith('/') ? '' : '/'}${participant.pet.profilePicture}`}
                        alt={participant.pet.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <Text variant="caption" fontWeight="bold" sx={{ color: 'primary.contrastText' }}>
                        {participant.pet?.name?.charAt(0).toUpperCase() || '🐾'}
                      </Text>
                    )}
                  </Box>
                  
                  {/* Pet Info */}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Text variant="caption" fontWeight="medium" sx={{ 
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {participant.pet?.name || 'Unknown Pet'}
                    </Text>
                    <Text variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {participant.pet?.gender && (
                        <span>
                          {participant.pet.gender === 'Male' || participant.pet.gender === 'M' ? '♂️' : 
                           participant.pet.gender === 'Female' || participant.pet.gender === 'F' ? '♀️' : ''}
                          {' '}
                        </span>
                      )}
                      {participant.pet?.species || 'Pet'}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Location and Address info for Meetup and Wedding posts */}
        {(post.postType === 0 || post.postType === 1) && (
          <Box sx={{ mb: 2 }}>
            {post.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Text variant="caption" color="text.secondary">
                  {post.location}
                </Text>
              </Box>
            )}
            {post.address && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <LocationOn sx={{ fontSize: 16, color: 'primary.main' }} />
                <Text variant="caption" color="text.primary" fontWeight="medium">
                  {post.address}
                </Text>
              </Box>
            )}
            {post.eventDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Event sx={{ fontSize: 16, color: 'primary.main' }} />
                <Text variant="caption" color="text.primary" fontWeight="medium">
                  {formatDate(post.eventDate)}
                </Text>
              </Box>
            )}
          </Box>
        )}

        {/* Image Gallery */}
        {post.images && post.images.length > 0 && (
          <PostImageGallery 
            images={post.images} 
            maxDisplay={compact ? 2 : 4}
            compact={compact}
          />
        )}

        {/* Status and type chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2, mb: 1 }}>
          <StatusChip 
            statusVariant="status"
            status={post.status}
            label={getStatusLabel(post.status)}
          />
          <StatusChip 
            statusVariant="type"
            postType={post.postType}
            label={getTypeLabel(post.postType)}
          />
        </Box>
      </CardContent>

      {/* Bottom Section - Engagement and Footer */}
      <Box sx={{ px: 2, pb: 2 }}>
        {/* Engagement Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1, pb: 1 }}>
          <LikeButton 
            postId={post.postId} 
            size="small" 
            showCount={true}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ChatBubbleOutline sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Text variant="body2" color="text.secondary">
              {commentCount}
            </Text>
          </Box>
        </Box>

        {/* Footer with additional info */}
        {!compact && post.updatedAt !== post.createdAt && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Text variant="caption" color="text.secondary">
              Updated: {formatDate(post.updatedAt)}
            </Text>
          </Box>
        )}
      </Box>

      {/* Action menu */}
      {hasActions && (
        <CardActions
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: anchorEl ? 'flex' : 'none',
            gap: 1
          }}
        >
          {(canEdit || editPermissions) && (
            <Tooltip title={editPermissions?.reason || 'Edit post'}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  disabled={!canEdit}
                  sx={{ 
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:disabled': { 
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled'
                    }
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
          {(canDelete || deletePermissions) && (
            <Tooltip title={deletePermissions?.reason || 'Delete post'}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  disabled={!canDelete}
                  sx={{ 
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
                    '&:disabled': { 
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled'
                    }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default PostCard;
