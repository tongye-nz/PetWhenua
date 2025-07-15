import React from 'react';
import { Box, Avatar, Card, CardContent, Chip } from '@mui/material';
import { Person, Pets, Article, Group } from '@mui/icons-material';
import { Button, Text } from '../../../ui';
import { FollowButton } from '../../../ui';
import type { UserProfileData } from '../../../../types/userProfile.types';

export interface ProfileSummaryProps {
  profileData: UserProfileData;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  onEditClick?: () => void;
  followerCount?: number;
  postsCount?: number;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({
  profileData,
  isOwnProfile,
  isFollowing = false,
  onFollowChange,
  onEditClick,
  followerCount = 0,
  postsCount = 0
}) => {
  const fullName = profileData.firstName && profileData.lastName 
    ? `${profileData.firstName} ${profileData.lastName}`
    : null;

  const displayName = fullName || profileData.username;

  return (
    <Card sx={{ mb: 2, position: 'sticky', top: 16 }}>
      <CardContent>
        {/* Avatar and Basic Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={profileData.profilePicture}
            sx={{ 
              width: 120, 
              height: 120, 
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '2.5rem'
            }}
          >
            {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
          </Avatar>
          
          <Text variant="h5" fontWeight="bold" sx={{ textAlign: 'center', mb: 1 }}>
            {displayName}
          </Text>
          
          {fullName && (
            <Text variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              @{profileData.username}
            </Text>
          )}
          
          {profileData.region && profileData.district && (
            <Chip 
              icon={<Person />}
              label={`${profileData.region}, ${profileData.district}`}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
          )}
        </Box>

        {/* Bio */}
        {profileData.bio && (
          <Box sx={{ mb: 3 }}>
            <Text variant="body2" sx={{ textAlign: 'center', lineHeight: 1.5 }}>
              {profileData.bio}
            </Text>
          </Box>
        )}

        {/* Stats */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          mb: 3,
          py: 2,
          backgroundColor: 'grey.50',
          borderRadius: 2
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
              <Pets sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
              <Text variant="h6" fontWeight="bold" color="primary">
                {profileData.petCount || 0}
              </Text>
            </Box>
            <Text variant="caption" color="text.secondary">
              Pets
            </Text>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
              <Article sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
              <Text variant="h6" fontWeight="bold" color="success">
                {postsCount}
              </Text>
            </Box>
            <Text variant="caption" color="text.secondary">
              Posts
            </Text>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
              <Group sx={{ fontSize: 16, mr: 0.5, color: 'info.main' }} />
              <Text variant="h6" fontWeight="bold" color="info">
                {followerCount}
              </Text>
            </Box>
            <Text variant="caption" color="text.secondary">
              Followers
            </Text>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {isOwnProfile ? (
            <Button
              variant="outline"
              onClick={onEditClick}
              fullWidth
            >
              Edit Profile
            </Button>
          ) : (
            <FollowButton
              userId={parseInt(profileData.id)}
              isFollowing={isFollowing}
              onFollowChange={onFollowChange}
            />
          )}
        </Box>

        {/* Join Date */}
        {profileData.joinDate && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Text variant="caption" color="text.secondary">
              Member since {profileData.joinDate}
            </Text>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSummary;
