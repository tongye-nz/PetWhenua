import React from 'react';
import { 
  Box, 
  Paper, 
  Stack, 
  Avatar,
  Chip
} from '@mui/material';
import { Button, Text } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Avatar
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'primary.main',
              fontSize: '2rem'
            }}
          >
            {user.firstName?.[0] || user.username[0]}
          </Avatar>
          
          <Stack spacing={1} alignItems="center">
            <Text variant="h4" fontWeight="bold">
              Welcome, {user.firstName || user.username}! 🎉
            </Text>
            
            <Text variant="body1" color="text.secondary">
              You have successfully logged into PetWhenua
            </Text>
            
            <Chip 
              label={`Role: ${user.role}`} 
              color="primary" 
              variant="outlined" 
            />
          </Stack>

          <Box sx={{ 
            bgcolor: 'grey.50', 
            p: 3, 
            borderRadius: 2, 
            width: '100%',
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Text variant="h6" gutterBottom>
              Your Profile Information
            </Text>
            
            <Stack spacing={1}>
              <Text><strong>Username:</strong> {user.username}</Text>
              <Text><strong>Email:</strong> {user.email}</Text>
              {user.firstName && (
                <Text><strong>First Name:</strong> {user.firstName}</Text>
              )}
              {user.lastName && (
                <Text><strong>Last Name:</strong> {user.lastName}</Text>
              )}
              {user.location && (
                <Text><strong>Location:</strong> {user.location}</Text>
              )}
              {user.phoneNumber && (
                <Text><strong>Phone:</strong> {user.phoneNumber}</Text>
              )}
              <Text>
                <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outline"
              onClick={handleViewProfile}
              size="large"
            >
              View Profile
            </Button>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              size="large"
            >
              Logout
            </Button>
            
            <Button
              variant="primary"
              size="large"
              disabled
            >
              Coming Soon: Pet Management
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Dashboard; 