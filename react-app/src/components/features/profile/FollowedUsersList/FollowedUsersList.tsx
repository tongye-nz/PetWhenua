import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  IconButton,
  Skeleton,
  Alert
} from '@mui/material';
import { PersonAdd, MoreVert } from '@mui/icons-material';
import { Text, FollowButton } from '../../../ui';
import { userFollowService } from '../../../../api/userFollow.api';
import type { User } from '../../../../models/auth.types';

export interface FollowedUsersListProps {
  userId: number;
  isOwnProfile: boolean;
  maxUsers?: number;
}

const FollowedUsersList: React.FC<FollowedUsersListProps> = ({
  userId,
  isOwnProfile,
  maxUsers = 6
}) => {
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [followStatusMap, setFollowStatusMap] = useState<Record<number, boolean>>({});

  // Load followed users
  const loadFollowedUsers = async () => {
    setLoading(true);
    setError('');

    try {
      let users: User[];
      
      if (isOwnProfile) {
        // Load current user's following list
        users = await userFollowService.getMyFollowing();
      } else {
        // Load specific user's following list
        users = await userFollowService.getUserFollowing(userId);
      }

      // Limit the number of users displayed
      const limitedUsers = users.slice(0, maxUsers);
      setFollowedUsers(limitedUsers);

      // For non-own profiles, load follow status for each user
      if (!isOwnProfile) {
        const statusMap: Record<number, boolean> = {};
        await Promise.all(
          limitedUsers.map(async (user) => {
            try {
              const status = await userFollowService.isFollowing(user.userId);
              statusMap[user.userId] = status;
            } catch (error) {
              console.debug('Failed to load follow status for user:', user.userId);
              statusMap[user.userId] = false;
            }
          })
        );
        setFollowStatusMap(statusMap);
      }
    } catch (err) {
      console.error('Failed to load followed users:', err);
      setError('Failed to load followed users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load if userId is valid
    if (userId && userId > 0) {
      loadFollowedUsers();
    } else {
      setError('Invalid user ID');
      setLoading(false);
    }
  }, [userId, isOwnProfile]);

  // Handle follow/unfollow changes
  const handleFollowChange = (targetUserId: number, isFollowing: boolean) => {
    // Update the follow status map
    setFollowStatusMap(prev => ({
      ...prev,
      [targetUserId]: isFollowing
    }));

    // If unfollowing, remove from the list (for own profile)
    if (!isFollowing && isOwnProfile) {
      setFollowedUsers(prev => prev.filter(user => user.userId !== targetUserId));
    }
  };

  if (loading) {
    return (
      <Card sx={{ 
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        mb: 2
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontWeight: 600,
            fontSize: '1.1rem'
          }}>
            <PersonAdd sx={{ color: 'primary.main' }} />
            {isOwnProfile ? 'Following' : 'Follows'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[...Array(3)].map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ 
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        mb: 2
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontWeight: 600,
            fontSize: '1.1rem'
          }}>
            <PersonAdd sx={{ color: 'primary.main' }} />
            {isOwnProfile ? 'Following' : 'Follows'}
          </Typography>
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      mb: 2,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontWeight: 600,
            fontSize: '1.1rem'
          }}>
            <PersonAdd sx={{ color: 'primary.main' }} />
            {isOwnProfile ? 'Following' : 'Follows'} {followedUsers.length > 0 && `(${followedUsers.length})`}
          </Typography>
          
          {followedUsers.length > maxUsers && (
            <IconButton size="small" sx={{ 
              bgcolor: 'rgba(102, 126, 234, 0.1)',
              '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' }
            }}>
              <MoreVert sx={{ color: 'primary.main' }} />
            </IconButton>
          )}
        </Box>

        {followedUsers.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 3,
            color: 'text.secondary'
          }}>
            <PersonAdd sx={{ fontSize: 48, opacity: 0.5, mb: 1, color: 'primary.main' }} />
            <Text variant="body2">
              {isOwnProfile ? "You're not following anyone yet" : "Not following anyone yet"}
            </Text>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {followedUsers.map((user) => (
              <Box 
                key={user.userId}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    borderColor: 'rgba(102, 126, 234, 0.2)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                {/* User Avatar */}
                <Avatar 
                  src={user.profilePicture}
                  sx={{ width: 40, height: 40 }}
                >
                  {user.firstName?.charAt(0) || user.username.charAt(0)}
                </Avatar>

                {/* User Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Text 
                    variant="body2" 
                    fontWeight="medium"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.username
                    }
                  </Text>
                  {user.firstName && user.lastName && (
                    <Text 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      @{user.username}
                    </Text>
                  )}
                </Box>

                {/* Follow Button - only show for other users when viewing others' profiles */}
                {!isOwnProfile && (
                  <FollowButton
                    userId={user.userId}
                    isFollowing={followStatusMap[user.userId] || false}
                    onFollowChange={(isFollowing) => handleFollowChange(user.userId, isFollowing)}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* View All Link */}
        {followedUsers.length >= maxUsers && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Text 
              variant="body2" 
              color="primary"
              sx={{ 
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              View all
            </Text>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowedUsersList;
