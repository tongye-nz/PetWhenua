import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Stack, 
  Avatar,
  Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
            <Typography variant="h4" fontWeight="bold">
              Welcome, {user.firstName || user.username}! 🎉
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              You have successfully logged into PetWhenua
            </Typography>
            
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
            <Typography variant="h6" gutterBottom>
              Your Profile Information
            </Typography>
            
            <Stack spacing={1}>
              <Typography><strong>Username:</strong> {user.username}</Typography>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              {user.firstName && (
                <Typography><strong>First Name:</strong> {user.firstName}</Typography>
              )}
              {user.lastName && (
                <Typography><strong>Last Name:</strong> {user.lastName}</Typography>
              )}
              {user.location && (
                <Typography><strong>Location:</strong> {user.location}</Typography>
              )}
              {user.phoneNumber && (
                <Typography><strong>Phone:</strong> {user.phoneNumber}</Typography>
              )}
              <Typography>
                <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
              size="large"
            >
              Logout
            </Button>
            
            <Button
              variant="contained"
              color="primary"
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