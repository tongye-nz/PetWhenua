import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Box,
  Avatar,
  Chip,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import { 
  ArrowBack, 
  Edit,
  Cake,
  Pets,
  Male,
  Female
} from '@mui/icons-material';
import { blue, pink, grey } from '@mui/material/colors';
import { Button, Text, LoadingSpinner } from '../components/ui';
import { PetFormDialog, PetSelectionDialog } from '../components/features/pets';
import { useAuth } from '../contexts/AuthContext';
import { petService } from '../api/pet.api';
import { petConnectionService } from '../api/petConnection.api';
import type { Pet, PetFormData } from '../models/pet.types';
import type { PetConnectionStatus } from '../models/petConnection.types';
import { formatPetAge, calculateAgeInYears } from '../models/pet.types';
import { getProfilePictureUrl } from '../utils/imageUrlUtils';
import { formatDate as formatDateUtil } from '../utils/dateUtils';

const PetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state for editing
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pet connection state
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<PetConnectionStatus | null>(null);
  const [loadingConnection, setLoadingConnection] = useState(false);
  const [connectedPets, setConnectedPets] = useState<Pet[]>([]);
  const [loadingConnectedPets, setLoadingConnectedPets] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      if (!id) {
        setError('Pet ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const petData = await petService.getPetById(parseInt(id), true); // Include user data
        setPet(petData);
        
        // Fetch connected pets for this pet
        if (petData.petId) {
          await fetchConnectedPets(petData.petId);
        }
        
        // Check connection status if this is not the user's own pet
        if (user && petData.userId !== user.userId) {
          await checkConnectionStatus(petData);
        }
      } catch (err) {
        console.error('Failed to fetch pet:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pet details');
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const checkConnectionStatus = async (targetPet: Pet) => {
    if (!user?.userId || !targetPet.petId) return;
    
    try {
      setLoadingConnection(true);
      
      // Get current user's pets
      const userPets = await petService.getCurrentUserPets();
      
      if (userPets.length === 0) {
        setConnectionStatus(null);
        return;
      }
      
      // Check connection status between user's pets and target pet
      let overallStatus: PetConnectionStatus | null = null;
      
      for (const userPet of userPets) {
        if (userPet.petId) {
          try {
            const statusResponse = await petConnectionService.getConnectionStatus(
              userPet.petId, 
              targetPet.petId
            );
            
            // Priority: Accepted > Pending > null
            if (statusResponse.status === 'Accepted') {
              overallStatus = 'Accepted';
              break; // Accepted is highest priority, stop checking
            } else if (statusResponse.status === 'Pending' && overallStatus !== 'Accepted') {
              overallStatus = 'Pending';
            }
          } catch (error) {
            // If no connection exists between these pets, continue checking others
            console.log(`No connection between pet ${userPet.petId} and ${targetPet.petId}`);
          }
        }
      }
      
      setConnectionStatus(overallStatus);
      console.log('Connection status check result:', overallStatus);
    } catch (error) {
      console.error('Failed to check connection status:', error);
      setConnectionStatus(null);
    } finally {
      setLoadingConnection(false);
    }
  };

  const fetchConnectedPets = async (petId: number) => {
    try {
      setLoadingConnectedPets(true);
      const connected = await petConnectionService.getConnectedPets(petId);
      setConnectedPets(connected);
    } catch (error) {
      console.error('Failed to fetch connected pets:', error);
      setConnectedPets([]);
    } finally {
      setLoadingConnectedPets(false);
    }
  };

  const handleConnectClick = () => {
    setConnectDialogOpen(true);
  };

  const handleConnectionRequested = async () => {
    setSuccess('Connection request sent! Wait for the pet owner to respond.');
    setConnectionStatus('Pending');
    
    // Refresh both connected pets and connection status
    if (pet?.petId) {
      await fetchConnectedPets(pet.petId);
      await checkConnectionStatus(pet);
    }
  };

  const handleEdit = () => {
    setEditingPet(pet);
    setEditFormOpen(true);
  };

  const handleEditSubmit = async (formData: PetFormData) => {
    if (!editingPet?.petId || !user?.userId) {
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);
      setSuccess(null); // Clear any previous success message

      // Convert form data to match backend format (same as useMyPets)
      const petData = {
        ...formData,
        userId: user.userId,
        // Calculate age from birth year for backend compatibility
        age: formData.birthYear !== '' ? calculateAgeInYears(formData.birthYear as number) : 0,
        // Ensure birth year and month are numbers or undefined - handle empty strings
        birthYear: formData.birthYear !== '' ? formData.birthYear as number : undefined,
        birthMonth: formData.birthMonth !== '' ? formData.birthMonth as number : undefined
      };

      // Update the pet
      await petService.updatePet(editingPet.petId, {
        ...petData,
        petId: editingPet.petId
      });
      
      // Close modal first
      setEditFormOpen(false);
      setEditingPet(null);
      
      // Set success message
      setSuccess('Pet Profile updated successfully!');
      
      // Add a small delay to ensure the backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then refetch the pet details to get the latest data
      const updatedPet = await petService.getPetById(editingPet.petId, true);
      setPet(updatedPet);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error('Failed to update pet:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to update pet');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditFormOpen(false);
    setEditingPet(null);
  };

  const formatDate = (dateString: string) => {
    return formatDateUtil(dateString);
  };

  const getAgeDisplay = () => {
    if (!pet) return '';
    
    if (pet.birthYear) {
      return formatPetAge(pet.birthYear, pet.birthMonth);
    } else if (pet.age !== undefined) {
      if (pet.age === 0) {
        return 'Under 1 year old';
      } else if (pet.age === 1) {
        return '1 year old';
      } else {
        return `${pet.age} years old`;
      }
    }
    return 'Age unknown';
  };

  const getGenderIcon = () => {
    if (!pet?.gender) return null;
    
    const gender = pet.gender.toLowerCase();
    if (gender === 'male' || gender === 'm') {
      return <Male sx={{ color: blue[500], fontSize: 20 }} />;
    } else if (gender === 'female' || gender === 'f') {
      return <Female sx={{ color: pink[500], fontSize: 20 }} />;
    }
    return null;
  };

  const isOwnPet = user?.userId === pet?.userId;

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" py={8}>
          <LoadingSpinner />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box py={4}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  if (!pet) {
    return (
      <Container>
        <Box py={4}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Pet not found
          </Alert>
          <Button 
            startIcon={<ArrowBack />}
            onClick={handleBack}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Header with back button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBack} sx={{ p: 1 }}>
          <ArrowBack />
        </IconButton>
        <Text variant="h4" component="h1">
          {pet.name}
        </Text>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          {isOwnPet ? (
            <Button
              variant="outline"
              startIcon={<Edit />}
              onClick={handleEdit}
            >
              Edit Pet
            </Button>
          ) : (
            <Button
              variant="primary"
              startIcon={<Pets />}
              onClick={handleConnectClick}
              disabled={loadingConnection || connectionStatus === 'Pending'}
            >
              {connectionStatus === 'Pending' 
                ? 'Request Sent' 
                : connectionStatus === 'Accepted'
                ? 'Connected'
                : 'Connect Pets'
              }
            </Button>
          )}
        </Box>
      </Box>

      {/* Conditional Layout based on ownership */}
      {isOwnPet ? (
        /* Owner Layout - Keep existing horizontal layout */
        <>
          {/* Main Pet Card */}
          <Card sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Pet Image Section */}
              <Box sx={{ 
                width: { xs: '100%', md: '300px' }, 
                height: { xs: '250px', md: '350px' },
                position: 'relative'
              }}>
                {pet.profilePicture ? (
                  <CardMedia
                    component="img"
                    image={getProfilePictureUrl(pet.profilePicture)}
                    alt={pet.name}
                    sx={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      borderRadius: { xs: '4px 4px 0 0', md: '4px 0 0 4px' }
                    }}
                  />
                ) : (
                  <Box sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: grey[200],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: { xs: '4px 4px 0 0', md: '4px 0 0 4px' }
                  }}>
                    <Pets sx={{ fontSize: 60, color: grey[400] }} />
                  </Box>
                )}
                
                {/* Pet Owner Avatar Overlay */}
                {pet.user && (
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '20px',
                    padding: '4px 12px 4px 4px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {pet.user.firstName?.[0] || pet.user.username[0]}
                    </Avatar>
                    <Text variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {pet.user.firstName && pet.user.lastName 
                        ? `${pet.user.firstName} ${pet.user.lastName}`
                        : pet.user.firstName || pet.user.lastName || pet.user.username}
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Pet Details Section */}
              <CardContent sx={{ flex: 1, p: 3 }}>
                {/* Pet Name and Basic Info */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Text variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                      {pet.name}
                    </Text>
                    {getGenderIcon()}
                  </Box>
                  
                  {/* Species and Breed Tags */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {pet.species && (
                      <Chip 
                        icon={<Pets />}
                        label={pet.species}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {pet.breed && (
                      <Chip 
                        label={pet.breed}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                    <Chip 
                      icon={<Cake />}
                      label={getAgeDisplay()}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {/* Pet Details Grid */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: grey[50] }}>
                  <Text variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Pet Details
                  </Text>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Text variant="body2" color="text.secondary">Species:</Text>
                      <Text variant="body2" sx={{ fontWeight: 500 }}>{pet.species || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text variant="body2" color="text.secondary">Breed:</Text>
                      <Text variant="body2" sx={{ fontWeight: 500 }}>{pet.breed || 'Not specified'}</Text>
                    </Box>
                    <Box>
                      <Text variant="body2" color="text.secondary">Age:</Text>
                      <Text variant="body2" sx={{ fontWeight: 500 }}>{getAgeDisplay()}</Text>
                    </Box>
                    <Box>
                      <Text variant="body2" color="text.secondary">Gender:</Text>
                      <Text variant="body2" sx={{ fontWeight: 500 }}>{pet.gender || 'Not specified'}</Text>
                    </Box>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Text variant="body2" color="text.secondary">Registered:</Text>
                      <Text variant="body2" sx={{ fontWeight: 500 }}>
                        {pet.createdAt ? formatDate(pet.createdAt) : 'Unknown'}
                      </Text>
                    </Box>
                  </Box>
                </Paper>

                {/* Description */}
                {pet.description && (
                  <Box sx={{ mb: 3 }}>
                    <Text variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                      {pet.description}
                    </Text>
                  </Box>
                )}
              </CardContent>
            </Box>
          </Card>
        </>
      ) : (
        /* Other User's Pet Layout - Single column, centered */
        <>
          {/* Centered Pet Avatar */}
          <Card sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              p: 4
            }}>
              {/* Large Centered Pet Avatar */}
              <Box sx={{ mb: 3 }}>
                {pet.profilePicture ? (
                  <Avatar
                    src={getProfilePictureUrl(pet.profilePicture)}
                    sx={{ 
                      width: 200, 
                      height: 200, 
                      boxShadow: 3,
                      border: '4px solid',
                      borderColor: 'primary.main'
                    }}
                  />
                ) : (
                  <Avatar sx={{ 
                    width: 200, 
                    height: 200, 
                    bgcolor: grey[200],
                    boxShadow: 3,
                    border: '4px solid',
                    borderColor: 'primary.main'
                  }}>
                    <Pets sx={{ fontSize: 80, color: grey[400] }} />
                  </Avatar>
                )}
              </Box>

              {/* Pet Name and Basic Info - Centered */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <Text variant="h3" component="h1" sx={{ fontWeight: 600 }}>
                    {pet.name}
                  </Text>
                  {getGenderIcon()}
                </Box>
                
                {/* Owner Info */}
                {pet.user && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mb: 2,
                    p: 1.5,
                    bgcolor: grey[50],
                    borderRadius: 2
                  }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {pet.user.firstName?.[0] || pet.user.username[0]}
                    </Avatar>
                    <Text variant="body2" sx={{ fontWeight: 500 }}>
                      Owned by {pet.user.firstName && pet.user.lastName 
                        ? `${pet.user.firstName} ${pet.user.lastName}`
                        : pet.user.firstName || pet.user.lastName || pet.user.username}
                    </Text>
                  </Box>
                )}
                
                {/* Species and Breed Tags - Centered */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {pet.species && (
                    <Chip 
                      icon={<Pets />}
                      label={pet.species}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {pet.breed && (
                    <Chip 
                      label={pet.breed}
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                  <Chip 
                    icon={<Cake />}
                    label={getAgeDisplay()}
                    color="info"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Pet Basic Information Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Text variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                Pet Information
              </Text>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: 3,
                maxWidth: 500,
                mx: 'auto'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Text variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    Species
                  </Text>
                  <Text variant="body1" sx={{ fontWeight: 500 }}>
                    {pet.species || 'Not specified'}
                  </Text>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Text variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    Breed
                  </Text>
                  <Text variant="body1" sx={{ fontWeight: 500 }}>
                    {pet.breed || 'Not specified'}
                  </Text>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Text variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    Age
                  </Text>
                  <Text variant="body1" sx={{ fontWeight: 500 }}>
                    {getAgeDisplay()}
                  </Text>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Text variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    Gender
                  </Text>
                  <Text variant="body1" sx={{ fontWeight: 500 }}>
                    {pet.gender || 'Not specified'}
                  </Text>
                </Box>
                <Box sx={{ textAlign: 'center', gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <Text variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    Member Since
                  </Text>
                  <Text variant="body1" sx={{ fontWeight: 500 }}>
                    {pet.createdAt ? formatDate(pet.createdAt) : 'Unknown'}
                  </Text>
                </Box>
              </Box>

              {/* Description */}
              {pet.description && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Text variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    About {pet.name}
                  </Text>
                  <Text variant="body1" sx={{ 
                    lineHeight: 1.6, 
                    color: 'text.secondary',
                    maxWidth: 600,
                    mx: 'auto'
                  }}>
                    {pet.description}
                  </Text>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Connect Button Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Text variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Connect with {pet.name}
              </Text>
              <Text variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                Send a connection request to enable interactions and potential playdates between your pets.
              </Text>
              <Button 
                variant="primary" 
                size="large"
                startIcon={<Pets />}
                onClick={handleConnectClick}
                disabled={loadingConnection || connectionStatus === 'Pending'}
                sx={{ 
                  minWidth: 200,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                {connectionStatus === 'Pending' 
                  ? 'Request Sent' 
                  : connectionStatus === 'Accepted'
                  ? 'Connected'
                  : 'Connect Pets'
                }
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Social Connections Section */}
      <Paper sx={{ p: 3 }}>
        <Text variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: isOwnPet ? 'left' : 'center' }}>
          {isOwnPet ? 'Connections' : `${pet.name}'s Friends`}
        </Text>
        
        {/* Connected Pets */}
        {loadingConnectedPets ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <LoadingSpinner size="small" />
          </Box>
        ) : connectedPets.length > 0 ? (
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            justifyContent: isOwnPet ? 'flex-start' : 'center'
          }}>
            {connectedPets.map((connectedPet) => (
              <Box key={connectedPet.petId} sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: grey[50],
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => navigate(`/pet/${connectedPet.petId}`)}
              >
                <Avatar 
                  src={getProfilePictureUrl(connectedPet.profilePicture)}
                  sx={{ 
                    width: isOwnPet ? 48 : 56, 
                    height: isOwnPet ? 48 : 56, 
                    bgcolor: 'primary.main',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    boxShadow: 1
                  }}
                >
                  {!connectedPet.profilePicture && connectedPet.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Text variant="caption" sx={{ 
                  fontWeight: 500, 
                  textAlign: 'center',
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {connectedPet.name}
                </Text>
              </Box>
            ))}
          </Box>
        ) : (
          <Text variant="body2" color="text.secondary" sx={{ 
            fontStyle: 'italic',
            textAlign: 'center',
            py: 2
          }}>
            {isOwnPet 
              ? 'No connections yet. Connect with other pets to build your network!' 
              : `${pet.name} hasn't connected with any pets yet.`
            }
          </Text>
        )}
      </Paper>

      {/* Edit Pet Modal */}
      <PetFormDialog
        open={editFormOpen}
        editingPet={editingPet}
        onSubmit={handleEditSubmit}
        onClose={handleEditCancel}
        isLoading={formLoading}
        error={formError}
      />

      {/* Pet Connection Dialog */}
      {pet && !isOwnPet && (
        <PetSelectionDialog
          open={connectDialogOpen}
          targetPet={pet}
          onClose={() => setConnectDialogOpen(false)}
          onConnectionRequested={handleConnectionRequested}
        />
      )}
    </Container>
  );
};

export default PetDetail;
