import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Alert,
  Typography,
  Button,
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack, Person, LocationOn } from '@mui/icons-material';
import { LoadingSpinner, FollowButton } from '../components/ui';
import { PetConnectionButton } from '../components/ui';
import { PostCard } from '../components/features/posts';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api/user.api';
import { userFollowService } from '../api/userFollow.api';
import { postService } from '../api/post.api';
import { petService } from '../api/pet.api';
import type { User } from '../models/auth.types';
import type { Post } from '../models/post.types';
import type { Pet } from '../models/pet.types';

const OtherUserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [currentUserPetId, setCurrentUserPetId] = useState<number | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  // Get current user's first pet for connection purposes
  useEffect(() => {
    if (currentUser?.userId) {
      loadCurrentUserPet();
    }
  }, [currentUser]);

  const loadCurrentUserPet = async () => {
    try {
      const pets = await petService.getUserPets(currentUser!.userId);
      if (pets.length > 0 && pets[0].petId) {
        setCurrentUserPetId(pets[0].petId);
      }
    } catch (error) {
      console.debug('Failed to load current user pets:', error);
    }
  };

  const loadUserProfile = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError('');

    try {
      const targetUserId = parseInt(userId, 10);

      // Load user profile
      const user = await userAPI.getUserById(targetUserId);
      setProfileUser(user);

      // Load follow status and stats
      if (currentUser?.userId) {
        const [isFollowingStatus, followStats] = await Promise.all([
          userFollowService.isFollowing(targetUserId),
          userFollowService.getUserFollowStats(targetUserId)
        ]);
        setIsFollowing(isFollowingStatus);
        setFollowerCount(followStats.followerCount);
      }

      // Load user's pets
      const pets = await petService.getUserPets(targetUserId);
      setUserPets(pets);

      // Load user's posts
      const posts = await postService.getUserPosts(targetUserId);
      setUserPosts(posts);

    } catch (error: any) {
      console.error('Failed to load user profile:', error);
      if (error?.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load user profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowChange = async (newFollowStatus: boolean) => {
    setIsFollowing(newFollowStatus);
    setFollowerCount(prev => newFollowStatus ? prev + 1 : prev - 1);
  };

  const handleViewPost = (post: Post) => {
    navigate(`/post/${post.postId}`);
  };

  const handleViewPet = (pet: Pet) => {
    navigate(`/pet/${pet.petId}`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LoadingSpinner 
          size="large"
          centered
          containerProps={{ minHeight: "400px" }}
        />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            User not found
          </Alert>
          <Button 
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button 
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      {/* Single Column Layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Header Section: User Avatar and Info */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* User Avatar */}
            <Avatar
              src={profileUser.profilePicture || undefined}
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 3,
                bgcolor: 'primary.main',
                fontSize: '3rem',
                fontWeight: 'bold'
              }}
            >
              {!profileUser.profilePicture && (
                profileUser.firstName?.charAt(0) || profileUser.username?.charAt(0) || <Person />
              )}
            </Avatar>

            {/* User Information */}
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {profileUser.firstName && profileUser.lastName 
                ? `${profileUser.firstName} ${profileUser.lastName}`
                : profileUser.username
              }
            </Typography>

            {profileUser.firstName && profileUser.lastName && (
              <Typography variant="h6" color="text.secondary" gutterBottom>
                @{profileUser.username}
              </Typography>
            )}

            {profileUser.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {profileUser.location}
                </Typography>
              </Box>
            )}

            {profileUser.bio && (
              <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, lineHeight: 1.6 }}>
                {profileUser.bio}
              </Typography>
            )}

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {userPets.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pets
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {userPosts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posts
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="info.main">
                  {followerCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Followers
                </Typography>
              </Box>
            </Box>

            {/* Follow Button */}
            {currentUser && currentUser.userId !== profileUser.userId && (
              <FollowButton
                userId={profileUser.userId}
                isFollowing={isFollowing}
                onFollowChange={handleFollowChange}
                size="large"
                variant="contained"
              />
            )}
          </Box>
        </Paper>

        {/* Pets Section */}
        {userPets.length > 0 && (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Pets ({userPets.length})
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {userPets.map((pet) => (
                <Box key={pet.petId}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleViewPet(pet)}
                  >
                    <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                      {pet.profilePicture ? (
                        <Box
                          component="img"
                          src={pet.profilePicture}
                          alt={pet.name}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'grey.100',
                            color: 'grey.500',
                            fontSize: '3rem'
                          }}
                        >
                          🐾
                        </Box>
                      )}
                    </Box>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {pet.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {pet.species} {pet.breed && `• ${pet.breed}`}
                      </Typography>
                      
                                             {/* Connect Button */}
                       {currentUser && currentUserPetId && pet.petId && (
                         <Box sx={{ mt: 2 }}>
                           <PetConnectionButton
                             myPetId={currentUserPetId}
                             targetPetId={pet.petId}
                             size="small"
                             variant="outlined"
                           />
                         </Box>
                       )}
                     </CardContent>
                   </Card>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Posts Section */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Posts ({userPosts.length})
          </Typography>
          {userPosts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography variant="body1">
                No posts yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {userPosts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  onView={handleViewPost}
                  showActions={false}
                  compact={false}
                />
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default OtherUserProfile; 