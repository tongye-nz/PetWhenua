import React, { useState, useEffect } from 'react';
import { Container, Box, Paper, Typography, Alert } from '@mui/material';
import { People as PeopleIcon, LocationOn } from '@mui/icons-material';
import { Text, LoadingSpinner } from '../components/ui';
import { UserCard } from '../components/features/users';
import { userAPI } from '../api/user.api';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../models/auth.types';

const UsersNearMe: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load users and filter by location
  const loadUsersNearMe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allUsers = await userAPI.getAllUsers();
      
      // Filter users by location if current user has location
      let filteredUsers = allUsers.filter(user => user.userId !== currentUser?.userId);
      
      if (currentUser?.location) {
        // Simple location matching - you can make this more sophisticated
        const currentLocation = currentUser.location.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.location && user.location.toLowerCase().includes(currentLocation.split(',')[0])
        );
      }
      
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users near you');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUsersNearMe();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 4 }}>
          You must be logged in to find users near you.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Text variant="h4" component="h1">
            Pet Owners Near You
          </Text>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Text variant="body1" color="text.secondary">
            {currentUser.location || 'No location set'} 
          </Text>
        </Box>
        <Text variant="body1" color="text.secondary">
          Connect with pet owners in your area and build lasting friendships for your pets
        </Text>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner />
        </Box>
      )}

      {/* No location warning */}
      {!loading && !currentUser.location && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'warning.50' }}>
          <Typography variant="h6" color="warning.main" sx={{ mb: 1 }}>
            Add Your Location
          </Typography>
          <Typography variant="body2" color="text.secondary">
            To find pet owners near you, please add your location in your profile settings.
          </Typography>
        </Paper>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
          <PeopleIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Text variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            {currentUser.location 
              ? 'No pet owners found in your area' 
              : 'No pet owners found'
            }
          </Text>
          <Text variant="body1" color="text.secondary">
            {currentUser.location 
              ? 'Try expanding your search or check back later for new members in your area.'
              : 'Set your location to find pet owners near you.'
            }
          </Text>
        </Box>
      )}

      {/* Users Grid */}
      {!loading && users.length > 0 && (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Found {users.length} pet owner{users.length !== 1 ? 's' : ''} near you
            </Typography>
          </Paper>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3
          }}>
            {users.map((user) => (
              <UserCard
                key={user.userId}
                user={user}
                showFollowButton={true}
              />
            ))}
          </Box>
        </>
      )}

      {/* Info Box */}
      {!loading && users.length > 0 && (
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'primary.50' }}>
          <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
            Connect with Pet Owners
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Follow users to stay updated with their pets' activities and join their meetups. 
            Build a community of pet lovers in your area!
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default UsersNearMe; 