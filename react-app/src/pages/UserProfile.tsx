import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Alert,
  Divider
} from '@mui/material';
import { 
  LoadingSpinner,
  ProfileAvatarSection,
  ProfileInfoForm,
  ProfileHeaderSection
} from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfileForm } from '../hooks/useUserProfileForm';
import type { UserProfileData } from '../types/userProfile.types';
import { userProfileStyles } from './UserProfile.styles';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  // Initialize profile data from authenticated user
  const getInitialProfileData = (): UserProfileData => ({
    id: user?.userId?.toString() || '',
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    region: '', // Will be loaded from API
    district: '', // Will be loaded from API
    profilePicture: user?.profilePicture || '',
    petCount: 0, // Will be loaded from API
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
  });

  // Profile data state
  const [profileData, setProfileData] = useState<UserProfileData>(getInitialProfileData());

  // API simulation function
  const saveUserProfile = async (data: UserProfileData): Promise<void> => {
    // TODO: Replace with actual API call
    // await userProfileAPI.updateProfile(data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update local profile data
    setProfileData(data);
  };

  // Load profile data from API
  const loadUserProfile = async (): Promise<void> => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const apiProfile = await userProfileAPI.getProfile(user?.userId);
      // setProfileData(apiProfile);
      
      // For now, use authenticated user data
      if (user) {
        const currentProfile = getInitialProfileData();
        setProfileData(currentProfile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <LoadingSpinner />
        </Box>
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