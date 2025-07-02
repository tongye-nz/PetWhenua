import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import { Edit, Save, Cancel, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userProfileStyles } from './userProfileStyles';

interface UserProfileData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  profilePicture?: string;
  petCount?: number;
  joinDate?: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile data state
  const [profileData, setProfileData] = useState<UserProfileData>({
    id: user?.userId?.toString() || '',
    username: user?.username || '',
    email: user?.email || '',
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    profilePicture: '',
    petCount: 0,
    joinDate: new Date().toLocaleDateString()
  });

  // Form data for editing
  const [formData, setFormData] = useState<UserProfileData>(profileData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load user profile data
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch user profile
      // For now, using mock data
      const mockProfile: UserProfileData = {
        id: user?.userId?.toString() || '1',
        username: user?.username || 'petlover123',
        email: user?.email || 'user@petwhenua.com',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Animal lover and proud owner of 2 dogs and 1 cat. Love organizing pet meetups!',
        location: 'Auckland, New Zealand',
        profilePicture: '',
        petCount: 3,
        joinDate: 'January 2024'
      };
      setProfileData(mockProfile);
      setFormData(mockProfile);
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (formData.bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof UserProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profileData);
    setFormErrors({});
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // TODO: Implement API call to update user profile
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProfileData(formData);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement file upload functionality
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          profilePicture: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !isEditing) {
    return (
      <Container style={userProfileStyles.container}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
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
            <Typography variant="h4" style={userProfileStyles.title}>
              My Profile
            </Typography>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
                style={userProfileStyles.editButton}
              >
                Edit Profile
              </Button>
            ) : (
              <Box>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                  onClick={handleSave}
                  disabled={loading}
                  style={userProfileStyles.saveButton}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  style={userProfileStyles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>

          <Divider style={userProfileStyles.divider} />

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" style={userProfileStyles.alert}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" style={userProfileStyles.alert}>
              {error}
            </Alert>
          )}

          <Box style={userProfileStyles.contentContainer}>
            {/* Profile Picture Section */}
            <Box style={userProfileStyles.leftSection}>
              <Box style={userProfileStyles.avatarSection}>
                <Avatar
                  src={formData.profilePicture || profileData.profilePicture}
                  style={userProfileStyles.avatar}
                >
                  {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                </Avatar>
                {isEditing && (
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
                    <Typography variant="caption" style={userProfileStyles.uploadText}>
                      Change Photo
                    </Typography>
                  </Box>
                )}
                <Box style={userProfileStyles.stats}>
                  <Typography variant="h6" style={userProfileStyles.statNumber}>
                    {profileData.petCount}
                  </Typography>
                  <Typography variant="body2" style={userProfileStyles.statLabel}>
                    Pets Registered
                  </Typography>
                  <Typography variant="body2" style={userProfileStyles.joinDate}>
                    Joined {profileData.joinDate}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Profile Information Section */}
            <Box style={userProfileStyles.rightSection}>
              <Box style={userProfileStyles.formSection}>
                <Stack spacing={2}>
                  <Box style={userProfileStyles.nameRow}>
                    <TextField
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName}
                      style={userProfileStyles.halfWidth}
                    />
                    <TextField
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      error={!!formErrors.lastName}
                      helperText={formErrors.lastName}
                      style={userProfileStyles.halfWidth}
                    />
                  </Box>
                  <TextField
                    label="Username"
                    value={formData.username}
                    disabled={true}
                    fullWidth
                    style={userProfileStyles.textField}
                    helperText="Username cannot be changed"
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    fullWidth
                    style={userProfileStyles.textField}
                  />
                  <TextField
                    label="Location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    fullWidth
                    style={userProfileStyles.textField}
                    placeholder="e.g., Auckland, New Zealand"
                  />
                  <TextField
                    label="Bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={4}
                    error={!!formErrors.bio}
                    helperText={formErrors.bio || `${formData.bio.length}/500 characters`}
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