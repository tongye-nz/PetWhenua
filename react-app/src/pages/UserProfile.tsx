import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Alert,
  Divider,
  Typography,
  Button
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
import type { ProcessedImageResult } from '../utils/profileImageUtils';
import { profilePictureService } from '../api/profile.api';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfileForm } from '../hooks/useUserProfileForm';
import { userAPI, type UpdateUserProfileRequest } from '../api/user.api';
import { userFollowService } from '../api/userFollow.api';
import { postService } from '../api/post.api';

import { petService } from '../api/pet.api';
import { combineLocation, parseLocation } from '../utils/locationUtils';
import type { UserProfileData } from '../types/userProfile.types';

import { formatDate } from '../utils/dateUtils';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, checkAuth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === user?.userId?.toString();
  const targetUserId = userId ? parseInt(userId, 10) : user?.userId;
  
  // Get edit state from URL parameters
  const isEditingFromURL = searchParams.get('edit') === 'true';

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
              joinDate: user?.createdAt ? formatDate(user.createdAt) : formatDate(new Date().toISOString())
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
  const [isUserNotFound, setIsUserNotFound] = useState<boolean>(false);
  const [hasNetworkError, setHasNetworkError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 3;

  // Save user profile to backend
  const saveUserProfile = async (data: UserProfileData): Promise<void> => {
    try {
      const updateRequest: UpdateUserProfileRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        bio: data.bio,
        location: combineLocation(data.region, data.district),
        profilePicture: data.profilePicture,
        // Don't include phoneNumber for now as it's not in the profile form
      };

      const updatedUser = await userAPI.updateCurrentUser(updateRequest);
      
      // Update local profile data
      const { region, district } = parseLocation(updatedUser.location || '');
      setProfileData({
        ...data,
        region,
        district,
        profilePicture: updatedUser.profilePicture || data.profilePicture,
      });

      // Refresh auth context to update user data
      await checkAuth();
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  };

  // Load profile data from API with retry logic and parallel API calls
  const loadUserProfile = async (attemptNumber: number = 0): Promise<void> => {
    if (!targetUserId) {
      setError('User ID not available');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsUserNotFound(false);
    setHasNetworkError(false);

    try {
      let apiUser;
      
      if (isOwnProfile) {
        // Load current user's profile
        apiUser = await userAPI.getCurrentUser();
      } else {
        // Load other user's profile
        try {
          apiUser = await userAPI.getUserById(targetUserId);
        } catch (userError: any) {
          // Handle specific user not found error
          if (userError?.response?.status === 404) {
            setIsUserNotFound(true);
            setError('User not found');
            return;
          }
          throw userError;
        }
      }

      // Validate that we got user data
      if (!apiUser || !apiUser.userId) {
        setIsUserNotFound(true);
        setError('Invalid user data received');
        return;
      }

      const { region, district } = parseLocation(apiUser.location || '');
      
      // **PERFORMANCE OPTIMIZATION: Use Promise.allSettled for parallel API calls**
      // This loads all data simultaneously instead of waiting for each call to complete
      const [
        petsResult,
        followStatsResult,
        postsResult,
        followStatusResult
      ] = await Promise.allSettled([
        // Load pet count
        petService.getUserPets(apiUser.userId).then(pets => pets.length).catch(() => 0),
        
        // Load follow stats
        userFollowService.getUserFollowStats(apiUser.userId).catch(() => ({ followerCount: 0, followingCount: 0 })),
        
        // Load posts count (all posts)
        postService.getUserPosts(apiUser.userId)
          .then(posts => posts.length)
          .catch(() => 0),
        
        // Check follow status (only if not own profile and user is authenticated)
        (!isOwnProfile && user?.userId) 
          ? userFollowService.isFollowing(apiUser.userId).catch(() => false)
          : Promise.resolve(false)
      ]);

      // Extract results with fallbacks
      const petCount = petsResult.status === 'fulfilled' ? petsResult.value : 0;
      const followStats = followStatsResult.status === 'fulfilled' 
        ? followStatsResult.value 
        : { followerCount: 0, followingCount: 0 };
      const postsCount = postsResult.status === 'fulfilled' ? postsResult.value : 0;
      const followStatus = followStatusResult.status === 'fulfilled' ? followStatusResult.value : false;
      
      // Update all state in a single batch
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
        joinDate: formatDate(apiUser.createdAt)
      });

      setFollowStats({
        followerCount: followStats.followerCount,
        followingCount: followStats.followingCount
      });

      setPostsCount(postsCount);
      setIsFollowing(followStatus);

      // Reset retry count on success
      setRetryCount(0);

    } catch (error: any) {
      console.error('Failed to load profile:', error);
      
      // Check for network errors
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network') || error?.name === 'TypeError') {
        setHasNetworkError(true);
        setError('Network error. Please check your connection and try again.');
      } else if (error?.response?.status === 403) {
        setError('You do not have permission to view this profile.');
      } else if (error?.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error instanceof Error ? error.message : 'Failed to load profile. Please try again.');
      }
      
      // Retry logic for network errors
      if (hasNetworkError && attemptNumber < maxRetries) {
        setRetryCount(attemptNumber + 1);
        setTimeout(() => {
          loadUserProfile(attemptNumber + 1);
        }, Math.pow(2, attemptNumber) * 1000); // Exponential backoff: 1s, 2s, 4s
        return;
      }
      
      // Fall back to auth context data for own profile
      if (isOwnProfile && user) {
        const currentProfile = getInitialProfileData();
        setProfileData(currentProfile);
      }
    } finally {
      setIsLoading(false);
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

  // Initialize form with custom hook (only for own profile)
  const form = useUserProfileForm({
    initialData: profileData,
    onSave: isOwnProfile ? saveUserProfile : async () => {}
  });

  // Override form editing state with URL-based state
  const isEditing = isOwnProfile ? isEditingFromURL : false;

  // Custom handlers that update URL parameters
  const handleStartEditing = () => {
    if (isOwnProfile) {
      setSearchParams({ edit: 'true' });
    }
  };

  const handleCancelEditing = () => {
    if (isOwnProfile) {
      form.cancelEditing();
      // Remove edit parameter from URL to go back to view mode
      setSearchParams({});
    }
  };

  const handleSaveForm = async () => {
    if (isOwnProfile) {
      const success = await form.saveForm();
      if (success) {
        // Remove edit parameter from URL after successful save
        setSearchParams({});
      }
    }
  };

  // Sync form editing state with URL parameters
  useEffect(() => {
    if (isOwnProfile) {
      if (isEditingFromURL && !form.isEditing) {
        form.startEditing();
      } else if (!isEditingFromURL && form.isEditing) {
        form.cancelEditing();
      }
    }
  }, [isEditingFromURL, isOwnProfile]);

  // Load profile data on component mount and when userId changes
  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  // Handle profile picture change with processed image
  const handleProfilePictureChange = async (processedImage: ProcessedImageResult) => {
    // Use the processed image data URL for immediate preview
    form.handleInputChange('profilePicture', processedImage.dataUrl);
    
    try {
      // Upload the processed file to the server
      const uploadResult = await profilePictureService.uploadUserProfilePicture(processedImage.file);
      
      console.log('Profile picture upload result:', uploadResult);
      
      // Update the profile picture with the server URL
      form.handleInputChange('profilePicture', uploadResult.profilePicture);
      
      // Update local profile data
      setProfileData(prev => ({
        ...prev,
        profilePicture: uploadResult.profilePicture,
      }));
      
      console.log('Updated profile data with:', uploadResult.profilePicture);

      // Refresh auth context to update user data
      await checkAuth();

      console.log(`Profile picture uploaded successfully: ${(processedImage.originalSize / 1024).toFixed(1)}KB → ${(processedImage.processedSize / 1024).toFixed(1)}KB`);
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      // Keep the data URL as fallback
      handleProfilePictureError(error instanceof Error ? error.message : 'Failed to upload profile picture');
    }
  };

  // Handle profile picture processing errors
  const handleProfilePictureError = (error: string) => {
    console.error('Profile picture processing error:', error);
    // You can add toast notifications or other error handling here
  };

  // Show loading spinner during initial load
  if (isLoading || (!profileData.id && form.loading)) {
    return (
      <Container maxWidth="xl" sx={{ maxWidth: '1400px', px: 2, py: 4 }}>
        <LoadingSpinner 
          size="large"
          centered
          containerProps={{ minHeight: "400px" }}
        />
      </Container>
    );
  }

  // Enhanced Error States
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ maxWidth: '1400px', px: 2, py: 4 }}>
        <Paper elevation={3} sx={{ bgcolor: 'background.paper', borderRadius: 4, p: 4 }}>
          {isUserNotFound ? (
            // User Not Found Error
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 3
            }}>
              <Box sx={{ 
                fontSize: '4rem', 
                mb: 2,
                opacity: 0.5 
              }}>
                👤
              </Box>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}>
                User Not Found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 3,
                maxWidth: '400px',
                margin: '0 auto 24px auto',
                lineHeight: 1.6
              }}>
                The user you're looking for doesn't exist or may have been removed.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained"
                  onClick={() => window.history.back()}
                  sx={{ minWidth: '120px' }}
                >
                  Go Back
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => window.location.href = '/'}
                  sx={{ minWidth: '120px' }}
                >
                  Home
                </Button>
              </Box>
            </Box>
          ) : hasNetworkError ? (
            // Network Error
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 3
            }}>
              <Box sx={{ 
                fontSize: '4rem', 
                mb: 2,
                opacity: 0.5 
              }}>
                📡
              </Box>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}>
                Connection Problem
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 3,
                maxWidth: '400px',
                margin: '0 auto 24px auto',
                lineHeight: 1.6
              }}>
                Unable to connect to the server. Please check your internet connection and try again.
                {retryCount > 0 && (
                  <Box component="span" sx={{ 
                    display: 'block', 
                    mt: 1, 
                    fontSize: '0.875rem',
                    fontStyle: 'italic' 
                  }}>
                    Retry attempt {retryCount} of {maxRetries}
                  </Box>
                )}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained"
                  onClick={() => loadUserProfile(0)}
                  disabled={isLoading}
                  sx={{ minWidth: '120px' }}
                >
                  {isLoading ? 'Retrying...' : 'Try Again'}
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => window.location.reload()}
                  sx={{ minWidth: '120px' }}
                >
                  Refresh Page
                </Button>
              </Box>
            </Box>
          ) : (
            // Generic Error
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              px: 3
            }}>
              <Box sx={{ 
                fontSize: '4rem', 
                mb: 2,
                opacity: 0.5 
              }}>
                ⚠️
              </Box>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}>
                Something Went Wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 3,
                maxWidth: '400px',
                margin: '0 auto 24px auto',
                lineHeight: 1.6
              }}>
                {error}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained"
                  onClick={() => loadUserProfile(0)}
                  disabled={isLoading}
                  sx={{ minWidth: '120px' }}
                >
                  {isLoading ? 'Retrying...' : 'Try Again'}
                </Button>
                {!isOwnProfile && (
                  <Button 
                    variant="outlined"
                    onClick={() => window.history.back()}
                    sx={{ minWidth: '120px' }}
                  >
                    Go Back
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Box 
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container 
        maxWidth="xl"
        sx={{
          maxWidth: '1400px',
          px: 2,
        }}
      >
        <Paper 
          elevation={3} 
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: 4,
            boxShadow: (theme) => 
              theme.palette.mode === 'light' 
                ? '0 8px 32px rgba(0, 0, 0, 0.1)' 
                : '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Header */}
          <ProfileHeaderSection
            isEditing={isEditing}
            isLoading={form.loading}
            isValid={form.isValid}
            isOwnProfile={isOwnProfile}
            profileName={profileData.firstName && profileData.lastName 
              ? `${profileData.firstName} ${profileData.lastName}`
              : profileData.username
            }
            onStartEditing={handleStartEditing}
            onSaveForm={handleSaveForm}
            onCancelEditing={handleCancelEditing}
          />

          <Divider sx={{ mb: 4, bgcolor: 'divider' }} />

          {/* Success/Error Messages */}
          {form.success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {form.success}
            </Alert>
          )}
          {form.error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
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
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              // Remove restrictive height constraints to prevent content cutoff
              alignSelf: 'flex-start'
            }}>
              {!isOwnProfile || !isEditing ? (
                <>
                  <ProfileSummary
                    profileData={profileData}
                    isOwnProfile={isOwnProfile}
                    onEditClick={handleStartEditing}
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
                  {targetUserId && (
                    <FollowedUsersList
                      userId={targetUserId}
                      isOwnProfile={isOwnProfile}
                      maxUsers={6}
                    />
                  )}
                </>
              ) : (
                <>
                  {/* Profile Picture Section for editing */}
                  <ProfileAvatarSection
                    profileData={profileData}
                    formData={form.formData}
                    isEditing={isOwnProfile && isEditing}
                    onProfilePictureChange={handleProfilePictureChange}
                    onProfilePictureError={handleProfilePictureError}
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
              {!isOwnProfile || !isEditing ? (
                // Posts feed for viewing mode
                targetUserId ? (
                  <UserPostsFeed
                    userId={targetUserId}
                    isOwnProfile={isOwnProfile}
                    maxPosts={20}
                  />
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '200px',
                    bgcolor: 'background.paper',
                    borderRadius: '12px'
                  }}>
                    <Typography color="text.secondary">
                      Loading user data...
                    </Typography>
                  </Box>
                )
              ) : (
                // Edit form for own profile
                <Box sx={{ 
                  bgcolor: 'background.paper',
                  borderRadius: '12px',
                  padding: 2,
                  boxShadow: (theme) => theme.palette.mode === 'dark' 
                    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <ProfileInfoForm
                    formData={form.formData}
                    errors={form.errors}
                    isEditing={isOwnProfile && isEditing}
                    onInputChange={form.handleInputChange}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserProfile;