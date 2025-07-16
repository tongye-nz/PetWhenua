import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Box, Avatar, IconButton } from '@mui/material';
import { MoreVert, Edit, Delete, Person, ChatBubbleOutline, LocationOn, Event } from '@mui/icons-material';
import { Text, StatusChip, FollowButton, LikeButton } from '../../../ui';
import { commentService } from '../../../../api';
import PostImageGallery from '../../../PostImageGallery';
import type { Post } from '../../../../models/post.types';
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
  
  const isOwner = user?.userId === post.userId;
  const canEdit = isOwner && post.status === 0; // PostStatus.Active
  const canDelete = isOwner || user?.role === 'site_admin';
  const hasActions = showActions && (canEdit || canDelete);

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
          {canEdit && (
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 1,
                color: 'error.main',
                '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default PostCard;
