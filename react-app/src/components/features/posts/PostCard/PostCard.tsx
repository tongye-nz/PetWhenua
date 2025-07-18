import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Box, Avatar, IconButton } from '@mui/material';
import { MoreVert, Edit, Delete, Person, ChatBubbleOutline, LocationOn, Event } from '@mui/icons-material';
import { Text, StatusChip, FollowButton, LikeButton } from '../../../ui';
import { commentService } from '../../../../api';
import { userFollowService } from '../../../../api/userFollow.api';
import PostImageGallery from '../../../PostImageGallery';
import type { Post } from '../../../../models/post.types';
import { PostType, PostStatus } from '../../../../models/post.types';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatusLoaded, setFollowStatusLoaded] = useState(false);
  
  const isOwner = user?.userId === post.userId;
  // Users can edit their own posts only if status is Active, Inactive, or Pending
  // Cannot edit if status is Sold, Expired, or Cancelled
  const canEdit = isOwner && (
    post.status === PostStatus.Active || 
    post.status === PostStatus.Inactive || 
    post.status === PostStatus.Pending
  );
  // Only post authors can delete their own posts
  const canDelete = isOwner;
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

  // Load follow status for the post author
  useEffect(() => {
    const loadFollowStatus = async () => {
      if (!user?.userId || !post.user?.userId || isOwner) {
        setFollowStatusLoaded(true);
        return;
      }

      try {
        const status = await userFollowService.isFollowing(post.user.userId);
        setIsFollowing(status);
      } catch (error) {
        console.debug('Failed to load follow status:', error);
      } finally {
        setFollowStatusLoaded(true);
      }
    };

    loadFollowStatus();
  }, [post.user?.userId, user?.userId, isOwner]);

  // Handle follow status change
  const handleFollowChange = (newFollowStatus: boolean) => {
    setIsFollowing(newFollowStatus);
  };

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

  const handleProfilePictureClick = (event: React.MouseEvent) => {
    // Prevent event bubbling to parent components (PostCard click)
    event.preventDefault();
    event.stopPropagation();
    
    if (!post.user?.userId) return;
    
    // Navigate to appropriate profile page
    if (user?.userId === post.user.userId) {
      // Current user's profile
      navigate('/profile');
    } else {
      // Other user's profile
      navigate(`/user/${post.user.userId}`);
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getStatusLabel = (status: number) => {
    const labels = ['Active', 'Sold', 'Expired', 'Inactive', 'Cancelled', 'Pending'];
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
          <Avatar 
            src={post.user?.profilePicture || undefined}
            sx={{ 
              width: 32, 
              height: 32,
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
            onClick={handleProfilePictureClick}
          >
            {!post.user?.profilePicture && (post.user?.username ? post.user.username.charAt(0).toUpperCase() : <Person />)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Text variant="body2" fontWeight="medium">
              {post.user?.firstName && post.user?.lastName 
                ? `${post.user.firstName} ${post.user.lastName}` 
                : post.user?.username || 'Unknown User'}
            </Text>
            <Text variant="caption" color="text.secondary">
              {formatDate(post.createdAt)}
            </Text>
          </Box>
          
          {/* Follow button - only show for other users' posts */}
          {!isOwner && post.user && (
            <>
              {followStatusLoaded && (
                <FollowButton
                  userId={post.user.userId}
                  isFollowing={isFollowing}
                  onFollowChange={handleFollowChange}
                  size="small"
                  variant="outlined"
                />
              )}
            </>
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
                  <Avatar
                    src={(() => {
                      const profilePic = participant.pet?.profilePicture;
                      if (!profilePic) return undefined;
                      
                      console.log('Pet profile picture:', {
                        petName: participant.pet?.name,
                        profilePicLength: profilePic.length,
                        profilePicStart: profilePic.substring(0, 100),
                        isHttp: profilePic.startsWith('http'),
                        isData: profilePic.startsWith('data:')
                      });
                      
                      // If it's already a full URL, use it directly
                      if (profilePic.startsWith('http')) return profilePic;
                      
                      // If it's a data URL (base64), use it directly 
                      // Data URLs don't make HTTP requests, so length is less of an issue
                      if (profilePic.startsWith('data:')) {
                        console.log('Using data URL for pet:', participant.pet?.name);
                        return profilePic;
                      }
                      
                      // If it's a file path, construct the full URL
                      if (profilePic.length < 500) { // Only if path is reasonable length
                        const fullUrl = `http://localhost:5295${profilePic.startsWith('/') ? '' : '/'}${profilePic}`;
                        console.log('Constructed URL:', fullUrl);
                        return fullUrl;
                      }
                      
                      console.log('Profile picture too long, skipping');
                      return undefined;
                    })()}
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'primary.light',
                      fontSize: '1.75rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}
                  >
                    {participant.pet?.name?.charAt(0).toUpperCase() || '🐾'}
                  </Avatar>
                  
                  {/* Pet Info */}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Text variant="caption" fontWeight="medium" sx={{ 
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '1.25rem'
                    }}>
                      {participant.pet?.name || 'Unknown Pet'}
                    </Text>
                    <Text variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
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
            maxDisplay={post.images.length > 3 ? 3 : (compact ? 2 : post.images.length)}
            compact={compact}
          />
        )}

        {/* Status and type chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2, mb: 1 }}>
          {/* Only show status chip for post types that need status management */}
          {post.postType !== PostType.Library && post.postType !== PostType.Moment && (
            <StatusChip 
              statusVariant="status"
              status={post.status}
              label={getStatusLabel(post.status)}
            />
          )}
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
