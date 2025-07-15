import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Alert,
  Divider
} from '@mui/material';
import { 
  ProfileAvatarSection,
  ProfileInfoForm,
  ProfileHeaderSection,
  ProfileSummary,
  FollowedUsersList,
  UserPostsFeed
} from '../components/features/profile';
import { LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfileForm } from '../hooks/useUserProfileForm';
import { userAPI, type UpdateUserProfileRequest } from '../api/user.api';
import { userFollowService } from '../api/userFollow.api';
import { postService } from '../api/post.api';
import { PostType } from '../models/post.types';
import { petService } from '../api/pet.api';
import { combineLocation, parseLocation } from '../utils/locationUtils';
import type { UserProfileData } from '../types/userProfile.types';
import { userProfileStyles } from './UserProfile.styles';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, checkAuth } = useAuth();

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === user?.userId?.toString();
  const targetUserId = userId ? parseInt(userId, 10) : user?.userId;

  // Initialize profile data
  const getInitialProfileData = (): UserProfileData => {
    const { region, district } = parseLocation(user?.location || '');
    return {
      id: user?.userId?.toString() || '',
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      region,
      district,
      profilePicture: user?.profilePicture || '',
      petCount: 0, // Will be loaded from API
      joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
    };
  };

  // Profile data state
  const [profileData, setProfileData] = useState<UserProfileData>(getInitialProfileData());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followStats, setFollowStats] = useState<{ followerCount: number; followingCount: number }>({
    followerCount: 0,
    followingCount: 0
  });
  const [postsCount, setPostsCount] = useState<number>(0);

  // Save user profile to backend
  const saveUserProfile = async (data: UserProfileData): Promise<void> => {
    try {
      const updateRequest: UpdateUserProfileRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        bio: data.bio,
        location: combineLocation(data.region, data.district),
        // Don't include phoneNumber for now as it's not in the profile form
      };

      const updatedUser = await userAPI.updateCurrentUser(updateRequest);
      
      // Update local profile data
      const { region, district } = parseLocation(updatedUser.location || '');
      setProfileData({
        ...data,
        region,
        district,
      });

      // Refresh auth context to update user data
      await checkAuth();
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  };

  // Load profile data from API
  const loadUserProfile = async (): Promise<void> => {
    if (!targetUserId) {
      setError('User ID not available');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let apiUser;
      
      if (isOwnProfile) {
        // Load current user's profile
        apiUser = await userAPI.getCurrentUser();
      } else {
        // Load other user's profile
        apiUser = await userAPI.getUserById(targetUserId);
      }

      const { region, district } = parseLocation(apiUser.location || '');
      
      // Load pet count
      let petCount = 0;
      try {
        const userPets = await petService.getUserPets(apiUser.userId);
        petCount = userPets.length;
      } catch (petError) {
        console.error('Failed to load pets count:', petError);
        // Continue with petCount = 0 if pets can't be loaded
      }
      
      setProfileData({
        id: apiUser.userId.toString(),
        username: apiUser.username,
        email: apiUser.email,
        firstName: apiUser.firstName || '',
        lastName: apiUser.lastName || '',
        bio: apiUser.bio || '',
        region,
        district,
        profilePicture: apiUser.profilePicture || '',
        petCount: petCount,
        joinDate: new Date(apiUser.createdAt).toLocaleDateString()
      });

      // Load follow stats for the profile user
      await loadFollowStats(apiUser.userId);

      // Load posts count for the profile user
      await loadPostsCount(apiUser.userId);

      // Check if current user is following this profile (only if not own profile)
      if (!isOwnProfile && user?.userId) {
        await checkFollowStatus(apiUser.userId);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
      
      // Fall back to auth context data for own profile
      if (isOwnProfile && user) {
        const currentProfile = getInitialProfileData();
        setProfileData(currentProfile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load follow statistics
  const loadFollowStats = async (userId: number) => {
    try {
      const stats = await userFollowService.getUserFollowStats(userId);
      setFollowStats({
        followerCount: stats.followerCount,
        followingCount: stats.followingCount
      });
    } catch (error) {
      console.error('Error loading follow stats:', error);
    }
  };

  // Check if current user is following the profile user
  const checkFollowStatus = async (profileUserId: number) => {
    if (!user?.userId) return;
    
    try {
      const status = await userFollowService.isFollowing(profileUserId);
      setIsFollowing(status);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  // Toggle follow status
  const handleToggleFollow = async (targetUserId: number) => {
    if (!user?.userId) return;

    try {
      if (isFollowing) {
        await userFollowService.unfollowUser(targetUserId);
        setIsFollowing(false);
        setFollowStats(prev => ({ ...prev, followerCount: prev.followerCount - 1 }));
      } else {
        await userFollowService.followUser(targetUserId);
        setIsFollowing(true);
        setFollowStats(prev => ({ ...prev, followerCount: prev.followerCount + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  // Load posts count for the user
  const loadPostsCount = async (userId: number) => {
    try {
      const userPosts = await postService.getUserPosts(userId);
      const momentPosts = userPosts.filter(post => post.postType === PostType.Moment);
      setPostsCount(momentPosts.length);
    } catch (error) {
      console.error('Error loading posts count:', error);
    }
  };

  // Initialize form with custom hook (only for own profile)
  const form = useUserProfileForm({
    initialData: profileData,
    onSave: isOwnProfile ? saveUserProfile : async () => {}
  });

  // Load profile data on component mount and when userId changes
  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  // Handle profile picture change
  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement file upload functionality
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        form.handleInputChange('profilePicture', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show loading spinner during initial load
  if (isLoading || (!profileData.id && form.loading)) {
    return (
      <Container style={userProfileStyles.container}>
        <LoadingSpinner 
          size="large"
          centered
          containerProps={{ minHeight: "400px" }}
        />
      </Container>
    );
  }

  // Show error state
  if (error && !isOwnProfile) {
    return (
      <Container style={userProfileStyles.container}>
        <Paper elevation={3} style={userProfileStyles.profileCard}>
          <Alert severity="error">
            {error}
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <div style={userProfileStyles.background}>
      <Container style={userProfileStyles.container}>
        <Paper elevation={3} style={userProfileStyles.profileCard}>
          {/* Header */}
          <ProfileHeaderSection
            isEditing={form.isEditing}
            isLoading={form.loading}
            isValid={form.isValid}
            isOwnProfile={isOwnProfile}
            profileName={profileData.firstName && profileData.lastName 
              ? `${profileData.firstName} ${profileData.lastName}`
              : profileData.username
            }
            onStartEditing={form.startEditing}
            onSaveForm={form.saveForm}
            onCancelEditing={form.cancelEditing}
            styles={userProfileStyles}
          />

          <Divider style={userProfileStyles.divider} />

          {/* Success/Error Messages */}
          {form.success && (
            <Alert severity="success" style={userProfileStyles.alert}>
              {form.success}
            </Alert>
          )}
          {form.error && (
            <Alert severity="error" style={userProfileStyles.alert}>
              {form.error}
            </Alert>
          )}

          {/* Enhanced Two-Column Responsive Layout */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 3 },
            alignItems: 'flex-start',
            minHeight: { md: '70vh' }
          }}>
            {/* Left Column - Profile Summary & Followed Users */}
            <Box sx={{ 
              flex: { 
                xs: '1 1 100%', 
                md: '0 0 35%',
                lg: '0 0 350px' 
              },
              minWidth: 0,
              position: { md: 'sticky' },
              top: { md: 16 },
              maxHeight: { md: 'calc(100vh - 200px)' },
              overflowY: { md: 'auto' },
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {!isOwnProfile || !form.isEditing ? (
                <>
                  <ProfileSummary
                    profileData={profileData}
                    isOwnProfile={isOwnProfile}
                    onEditClick={form.startEditing}
                    followerCount={followStats.followerCount}
                    postsCount={postsCount}
                    isFollowing={isFollowing}
                    onFollowChange={async () => {
                      if (targetUserId) {
                        await handleToggleFollow(targetUserId);
                      }
                    }}
                  />
                  
                  {/* Followed Users List */}
                  <FollowedUsersList
                    userId={targetUserId || 0}
                    isOwnProfile={isOwnProfile}
                    maxUsers={6}
                  />
                </>
              ) : (
                <>
                  {/* Profile Picture Section for editing */}
                  <ProfileAvatarSection
                    profileData={profileData}
                    formData={form.formData}
                    isEditing={isOwnProfile && form.isEditing}
                    onProfilePictureChange={handleProfilePictureChange}
                    styles={userProfileStyles}
                  />
                </>
              )}
            </Box>

            {/* Right Column - Posts Feed or Edit Form */}
            <Box sx={{ 
              flex: '1 1 auto',
              minWidth: 0,
              width: { xs: '100%', md: '65%' },
              maxHeight: { md: 'calc(100vh - 200px)' },
              overflowY: { md: 'auto' }
            }}>
              {!isOwnProfile || !form.isEditing ? (
                // Posts feed for viewing mode
                <UserPostsFeed
                  userId={targetUserId || 0}
                  isOwnProfile={isOwnProfile}
                  maxPosts={20}
                />
              ) : (
                // Edit form for own profile
                <Box sx={{ 
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <ProfileInfoForm
                    formData={form.formData}
                    errors={form.errors}
                    isEditing={isOwnProfile && form.isEditing}
                    onInputChange={form.handleInputChange}
                    styles={userProfileStyles}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default UserProfile; 