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
    <Card sx={{ 
      mb: 2, 
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Avatar and Basic Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profileData.profilePicture}
            sx={{ 
              width: { xs: 100, md: 120 }, 
              height: { xs: 100, md: 120 }, 
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: { xs: '2rem', md: '2.5rem' },
              border: '4px solid',
              borderColor: 'background.paper',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
          >
            {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
          </Avatar>
          
          <Text variant="h5" fontWeight="bold" sx={{ 
            textAlign: 'center', 
            mb: 1,
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }}>
            {displayName}
          </Text>
          
          {fullName && (
            <Text variant="body2" color="text.secondary" sx={{ 
              mb: 1,
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
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

        {/* Enhanced Stats Section */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          mb: 3,
          p: 2,
          backgroundColor: 'rgba(102, 126, 234, 0.05)',
          borderRadius: 2,
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 0.5,
              gap: 0.5
            }}>
              <Pets sx={{ fontSize: { xs: 14, md: 16 }, color: 'primary.main' }} />
              <Text variant="h6" fontWeight="bold" color="primary" sx={{
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                {profileData.petCount || 0}
              </Text>
            </Box>
            <Text variant="caption" color="text.secondary" sx={{
              fontSize: { xs: '0.7rem', md: '0.75rem' },
              fontWeight: 500
            }}>
              Pets
            </Text>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 0.5,
              gap: 0.5
            }}>
              <Article sx={{ fontSize: { xs: 14, md: 16 }, color: 'success.main' }} />
              <Text variant="h6" fontWeight="bold" color="success" sx={{
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                {postsCount}
              </Text>
            </Box>
            <Text variant="caption" color="text.secondary" sx={{
              fontSize: { xs: '0.7rem', md: '0.75rem' },
              fontWeight: 500
            }}>
              Posts
            </Text>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 0.5,
              gap: 0.5
            }}>
              <Group sx={{ fontSize: { xs: 14, md: 16 }, color: 'info.main' }} />
              <Text variant="h6" fontWeight="bold" color="info" sx={{
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                {followerCount}
              </Text>
            </Box>
            <Text variant="caption" color="text.secondary" sx={{
              fontSize: { xs: '0.7rem', md: '0.75rem' },
              fontWeight: 500
            }}>
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
