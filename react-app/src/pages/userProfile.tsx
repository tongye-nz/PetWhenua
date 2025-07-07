import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Avatar,
  Alert,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { Button, Input, Text, LoadingSpinner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfileForm } from '../hooks/useUserProfileForm';
import { LocationSelector } from '../components';
import { VALIDATION_RULES } from '../utils/userProfileValidation';
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
          <Box style={userProfileStyles.header}>
            <Text variant="h4" style={userProfileStyles.title}>
              My Profile
            </Text>
            {!form.isEditing ? (
              <Button
                variant="outline"
                onClick={form.startEditing}
                style={userProfileStyles.editButton}
              >
                Edit Profile
              </Button>
            ) : (
              <Box>
                <Button
                  variant="primary"
                  onClick={form.saveForm}
                  disabled={form.loading || !form.isValid}
                  isLoading={form.loading}
                  style={userProfileStyles.saveButton}
                >
                  {form.loading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={form.cancelEditing}
                  style={userProfileStyles.cancelButton}
                  disabled={form.loading}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>

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
            <Box style={userProfileStyles.leftSection}>
              <Box style={userProfileStyles.avatarSection}>
                <Avatar
                  src={form.formData.profilePicture || profileData.profilePicture}
                  style={userProfileStyles.avatar}
                >
                  {form.formData.firstName.charAt(0)}{form.formData.lastName.charAt(0)}
                </Avatar>
                {form.isEditing && (
                  <Box style={userProfileStyles.uploadContainer}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-picture-upload"
                      type="file"
                      onChange={handleProfilePictureChange}
                    />
                    <label htmlFor="profile-picture-upload">
                      <IconButton
                        component="span"
                        style={userProfileStyles.uploadButton}
                      >
                        <PhotoCamera />
                      </IconButton>
                    </label>
                    <Text variant="caption" style={userProfileStyles.uploadText}>
                      Change Photo
                    </Text>
                  </Box>
                )}
                <Box style={userProfileStyles.stats}>
                  <Text variant="h6" style={userProfileStyles.statNumber}>
                    {profileData.petCount}
                  </Text>
                  <Text variant="body2" style={userProfileStyles.statLabel}>
                    Pets Registered
                  </Text>
                  <Text variant="body2" style={userProfileStyles.joinDate}>
                    Joined {profileData.joinDate}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Profile Information Section */}
            <Box style={userProfileStyles.rightSection}>
              <Box style={userProfileStyles.formSection}>
                <Stack spacing={2}>
                  {/* Name Fields */}
                  <Box style={userProfileStyles.nameRow}>
                    <Input
                      label="First Name"
                      value={form.formData.firstName}
                      onChange={(e) => form.handleInputChange('firstName', e.target.value)}
                      disabled={!form.isEditing}
                      error={!!form.errors.firstName}
                      helperText={form.errors.firstName}
                      style={userProfileStyles.halfWidth}
                    />
                    <Input
                      label="Last Name"
                      value={form.formData.lastName}
                      onChange={(e) => form.handleInputChange('lastName', e.target.value)}
                      disabled={!form.isEditing}
                      error={!!form.errors.lastName}
                      helperText={form.errors.lastName}
                      style={userProfileStyles.halfWidth}
                    />
                  </Box>

                  {/* Username (Read-only) */}
                  <Input
                    label="Username"
                    value={form.formData.username}
                    disabled={true}
                    fullWidth
                    style={userProfileStyles.textField}
                    helperText="Username cannot be changed"
                  />

                  {/* Email */}
                  <Input
                    label="Email"
                    type="email"
                    value={form.formData.email}
                    onChange={(e) => form.handleInputChange('email', e.target.value)}
                    disabled={!form.isEditing}
                    error={!!form.errors.email}
                    helperText={form.errors.email}
                    fullWidth
                    style={userProfileStyles.textField}
                  />

                  {/* Location Selection */}
                  <LocationSelector
                    region={form.formData.region}
                    district={form.formData.district}
                    disabled={!form.isEditing}
                    errors={form.errors}
                    onRegionChange={(region: string) => form.handleInputChange('region', region)}
                    onDistrictChange={(district: string) => form.handleInputChange('district', district)}
                  />

                  {/* Bio */}
                  <Input
                    label="Bio"
                    value={form.formData.bio}
                    onChange={(e) => form.handleInputChange('bio', e.target.value)}
                    disabled={!form.isEditing}
                    multiline
                    rows={4}
                    error={!!form.errors.bio}
                    helperText={form.errors.bio || `${form.formData.bio.length}/${VALIDATION_RULES.BIO_MAX_LENGTH} characters`}
                    fullWidth
                    style={userProfileStyles.textField}
                    placeholder="Tell us about yourself and your pets..."
                  />
                </Stack>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default UserProfile; 