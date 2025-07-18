import React from 'react';
import { Card, CardContent, Avatar, Box } from '@mui/material';
import { Text, FollowButton } from '../../../ui';
import { useAuth } from '../../../../contexts/AuthContext';
import type { User } from '../../../../models/auth.types';
import { getProfilePictureUrl } from '../../../../utils/imageUrlUtils';

export interface UserCardProps {
  user: User;
  isFollowing?: boolean;
  compact?: boolean;
  showFollowButton?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isFollowing = false,
  compact = false,
  showFollowButton = true,
  onFollowChange
}) => {
  const { user: currentUser } = useAuth();
  const isCurrentUser = currentUser?.userId === user.userId;

  const cardHeight = compact ? 150 : 200; // Reasonable height to accommodate 2-line names

  return (
    <Card 
      sx={{ 
        height: cardHeight,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 2,
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar 
            src={getProfilePictureUrl(user.profilePicture)}
            sx={{ 
              width: 64, 
              height: 64, 
              mb: 2, 
              bgcolor: 'primary.main', 
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            {user.firstName?.charAt(0) || user.username.charAt(0)}
          </Avatar>
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Text 
              variant={compact ? "body1" : "h6"} 
              fontWeight="bold"
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2, // Allow up to 2 lines for full name
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.2
              }}
            >
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.username
              }
            </Text>
            
            <Text variant="body2" color="text.secondary">
              @{user.username}
            </Text>
            
            {user.location && (
              <Text variant="caption" color="text.secondary">
                📍 {user.location}
              </Text>
            )}
            
            {user.bio && !compact && (
              <Text 
                variant="body2" 
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {user.bio}
              </Text>
            )}
          </Box>
          
          {/* Follow button - only show for other users */}
          {showFollowButton && !isCurrentUser && (
            <FollowButton
              userId={user.userId}
              isFollowing={isFollowing}
              size="small"
              variant="outlined"
              onFollowChange={onFollowChange}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCard;
