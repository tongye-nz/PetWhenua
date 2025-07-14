import React, { useState } from 'react';
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
  ProfileHeaderSection
} from '../components/features/profile';
import { LoadingSpinner } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfileForm } from '../hooks/useUserProfileForm';
import { userAPI, type UpdateUserProfileRequest } from '../api/user.api';
import { petService } from '../api/pet.api';
import { combineLocation, parseLocation } from '../utils/locationUtils';
import type { UserProfileData } from '../types/userProfile.types';
import { userProfileStyles } from './UserProfile.styles';

const UserProfile: React.FC = () => {
  const { user, checkAuth } = useAuth();

  // Initialize profile data from authenticated user
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
    try {
      const apiUser = await userAPI.getCurrentUser();
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
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Fall back to auth context data
      if (user) {
        const currentProfile = getInitialProfileData();
        setProfileData(currentProfile);
      }
    }
  };

  // Initialize form with custom hook
  const form = useUserProfileForm({
    initialData: profileData,
    onSave: saveUserProfile
  });

  // Load profile data on component mount
  React.useEffect(() => {
    loadUserProfile();
  }, []);

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
  if (!profileData.id && form.loading) {
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

  return (
    <div style={userProfileStyles.background}>
      <Container style={userProfileStyles.container}>
        <Paper elevation={3} style={userProfileStyles.profileCard}>
          {/* Header */}
          <ProfileHeaderSection
            isEditing={form.isEditing}
            isLoading={form.loading}
            isValid={form.isValid}
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

          <Box style={userProfileStyles.contentContainer}>
            {/* Profile Picture Section */}
            <ProfileAvatarSection
              profileData={profileData}
              formData={form.formData}
              isEditing={form.isEditing}
              onProfilePictureChange={handleProfilePictureChange}
              styles={userProfileStyles}
            />

            {/* Profile Information Section */}
            <ProfileInfoForm
              formData={form.formData}
              errors={form.errors}
              isEditing={form.isEditing}
              onInputChange={form.handleInputChange}
              styles={userProfileStyles}
            />
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default UserProfile; 