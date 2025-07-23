import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Paper, Typography, Alert, Button } from '@mui/material';
import { People as PeopleIcon, LocationOn, Settings } from '@mui/icons-material';
import { Text, LoadingSpinner } from '../components/ui';
import { UserCard } from '../components/features/users';
import { userAPI } from '../api/user.api';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../models/auth.types';

const UsersNearMe: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has complete location (region and district)
  const hasCompleteLocation = (userLocation: string | null | undefined): boolean => {
    if (!userLocation) return false;
    const locationParts = userLocation.split(',').map(part => part.trim()).filter(part => part.length > 0);
    return locationParts.length >= 2; // Need at least region and district
  };

  // Load users and filter by location
  const loadUsersNearMe = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if current user has complete location
      if (!hasCompleteLocation(currentUser?.location)) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      const allUsers = await userAPI.getAllUsers();
      
      // Filter users by location
      let filteredUsers = allUsers.filter(user => user.userId !== currentUser?.userId);
      
      // Extract region and district from current user's location
      const locationParts = currentUser!.location!.split(',').map(part => part.trim());
      const currentRegion = locationParts[0]?.toLowerCase();
      const currentDistrict = locationParts[1]?.toLowerCase();
      
      filteredUsers = filteredUsers.filter(user => {
        if (!hasCompleteLocation(user.location)) return false;
        
        const userLocationParts = user.location!.split(',').map(part => part.trim());
        const userRegion = userLocationParts[0]?.toLowerCase();
        const userDistrict = userLocationParts[1]?.toLowerCase();
        
        // Match both region and district for precise location matching
        return userRegion === currentRegion && userDistrict === currentDistrict;
      });
      
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

      {/* Location Required Card */}
      {!loading && !hasCompleteLocation(currentUser?.location) && (
        <Paper sx={{ 
          p: 4, 
          mb: 4, 
          bgcolor: 'primary.50',
          border: '2px solid',
          borderColor: 'primary.200',
          textAlign: 'center'
        }}>
          <LocationOn sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
            Set Your Location to Find Pet Owners Near You
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            To discover pet owners in your area, please add your region and district in your profile settings. 
            This helps us connect you with the right community of pet lovers nearby.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Settings />}
            onClick={() => navigate('/profile?edit=true')}
            sx={{ mt: 1 }}
          >
            Update Profile
          </Button>
        </Paper>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && !error && hasCompleteLocation(currentUser?.location) && (
        <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
          <PeopleIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Text variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            No pet owners found in your area
          </Text>
          <Text variant="body1" color="text.secondary">
            Check back later for new members in your area, or try connecting with pet owners from nearby regions.
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
              md: 'repeat(2, 1fr)', // Reduced from 3 to 2 for wider cards
              lg: 'repeat(3, 1fr)'  // Reduced from 4 to 3 for wider cards
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