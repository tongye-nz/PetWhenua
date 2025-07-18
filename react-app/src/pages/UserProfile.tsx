import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Alert,
  Divider,
  Typography,
  Button,
  Avatar
} from '@mui/material';
import { 
  ProfileAvatarSection,
  ProfileInfoForm,
  ProfileHeaderSection,
  UserPostsFeed,
  UserPetsSection
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

  // Load profile data from API with retry logic
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
      
      // Load pet count with error handling
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

      // Load follow stats with error handling
      try {
        await loadFollowStats(apiUser.userId);
      } catch (followError) {
        console.error('Failed to load follow stats:', followError);
        // Continue without follow stats
      }

      // Load posts count with error handling
      try {
        await loadPostsCount(apiUser.userId);
      } catch (postsError) {
        console.error('Failed to load posts count:', postsError);
        // Continue without posts count
      }

      // Check if current user is following this profile (only if not own profile)
      if (!isOwnProfile && user?.userId) {
        try {
          await checkFollowStatus(apiUser.userId);
        } catch (followStatusError) {
          console.error('Failed to check follow status:', followStatusError);
          // Continue without follow status
        }
      }

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

  // Enhanced Error States
  if (error) {
    return (
      <Container style={userProfileStyles.container}>
        <Paper elevation={3} style={userProfileStyles.profileCard}>
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
    <div style={userProfileStyles.background}>
      <Container style={userProfileStyles.container}>
        <Paper elevation={3} style={userProfileStyles.profileCard}>
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

          {/* Single Column Layout */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {!isOwnProfile || !isEditing ? (
              <>
                {/* Header Section - Centered Profile Info */}
                <Box sx={{ 
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: 4,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  textAlign: 'center'
                }}>
                  {/* Centered Avatar */}
                  <Avatar
                    src={profileData.profilePicture}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mb: 2,
                      mx: 'auto',
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                      border: '4px solid',
                      borderColor: 'background.paper',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                  </Avatar>
                  
                  {/* User Info */}
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {profileData.firstName && profileData.lastName 
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : profileData.username
                    }
                  </Typography>
                  
                  {profileData.firstName && profileData.lastName && (
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      @{profileData.username}
                    </Typography>
                  )}
                  
                  {profileData.bio && (
                    <Typography variant="body1" sx={{ mb: 2, maxWidth: '600px', mx: 'auto' }}>
                      {profileData.bio}
                    </Typography>
                  )}
                  
                  {profileData.region && profileData.district && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      📍 {profileData.region}, {profileData.district}
                    </Typography>
                  )}
                  
                  {/* Stats */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: 4,
                    mb: 3
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight="bold" color="primary">
                        {profileData.petCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pets
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {postsCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Posts
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight="bold" color="info.main">
                        {followStats.followerCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Followers
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Action Buttons */}
                  {isOwnProfile ? (
                    <Button
                      variant="outlined"
                      onClick={handleStartEditing}
                      size="large"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      variant={isFollowing ? "outlined" : "contained"}
                      onClick={async () => {
                        if (targetUserId) {
                          await handleToggleFollow(targetUserId);
                        }
                      }}
                      size="large"
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                  
                  {profileData.joinDate && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      Member since {profileData.joinDate}
                    </Typography>
                  )}
                </Box>

                {/* Pets Section */}
                {targetUserId && (
                  <UserPetsSection
                    userId={targetUserId}
                    isOwnProfile={isOwnProfile}
                  />
                )}

                {/* Posts Section */}
                {targetUserId && (
                  <UserPostsFeed
                    userId={targetUserId}
                    isOwnProfile={isOwnProfile}
                    maxPosts={20}
                  />
                )}
              </>
            ) : (
              // Edit form for own profile
              <>
                {/* Profile Picture Section for editing */}
                <ProfileAvatarSection
                  profileData={profileData}
                  formData={form.formData}
                  isEditing={isOwnProfile && isEditing}
                  onProfilePictureChange={handleProfilePictureChange}
                  styles={userProfileStyles}
                />
                
                <Box sx={{ 
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: 3,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <ProfileInfoForm
                    formData={form.formData}
                    errors={form.errors}
                    isEditing={isOwnProfile && isEditing}
                    onInputChange={form.handleInputChange}
                    styles={userProfileStyles}
                  />
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default UserProfile;