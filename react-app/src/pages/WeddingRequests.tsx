import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  useTheme,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Visibility,
  LocationOn,
  CalendarToday,
  Person,
  Pets
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner, Button } from '../components/ui';
import { petWeddingService } from '../api/petWedding.api';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../utils/dateUtils';
import { getProfilePictureUrl } from '../utils/imageUrlUtils';
import type { PetWeddingPost } from '../models/petWedding.types';

const WeddingRequests: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [weddingRequests, setWeddingRequests] = useState<PetWeddingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadPendingWeddingRequests();
  }, []);

  const loadPendingWeddingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const requests = await petWeddingService.getPendingWeddingApprovals();
      setWeddingRequests(requests);
    } catch (err: any) {
      console.error('Failed to load wedding requests:', err);
      setError('Failed to load wedding requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (postId: number, action: 'approve' | 'decline') => {
    if (!currentUser) return;

    try {
      setActionLoading(prev => ({ ...prev, [postId]: true }));
      setError('');
      setSuccess('');

      if (action === 'approve') {
        await petWeddingService.approvePetWeddingParticipation(postId);
        setSuccess('Wedding request approved successfully!');
      } else {
        await petWeddingService.rejectPetWeddingParticipation(postId);
        setSuccess('Wedding request declined.');
      }

      // Remove the processed request from the list
      setWeddingRequests(prev => prev.filter(req => req.postId !== postId));

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error(`Failed to ${action} wedding request:`, err);
      setError(err?.response?.data?.message || `Failed to ${action} request. Please try again.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewDetails = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <LoadingSpinner size="large" />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            fontSize: { xs: '1.75rem', md: '2.125rem' },
            fontWeight: 600,
            mb: 0.5
          }}>
            Pet Wedding Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and respond to pet wedding requests involving your pets
          </Typography>
        </Box>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Results Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          You have {weddingRequests.length} pending wedding request{weddingRequests.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Wedding Requests List */}
      {weddingRequests.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Pets sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
            No Pending Wedding Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any pending pet wedding requests at the moment.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {weddingRequests.map((wedding) => (
            <Card 
              key={wedding.postId} 
              sx={{ 
                overflow: 'visible',
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                {/* Status Badge */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip
                    label="Pending Your Response"
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(wedding.createdAt)}
                  </Typography>
                </Box>

                {/* Wedding Title and Content */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {wedding.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {wedding.content}
                </Typography>

                {/* Wedding Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Created by {wedding.user?.firstName || wedding.user?.username || 'Someone'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Event Date: {wedding.eventDate ? formatDateTime(wedding.eventDate) : 'Not specified'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {wedding.location} • {wedding.address}
                    </Typography>
                  </Box>
                </Box>

                {/* Pets Involved */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Pets Involved:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {wedding.petWeddingParticipants?.map((participant) => (
                      <Box 
                        key={participant.participantId}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          p: 2,
                          bgcolor: participant.owner?.userId === currentUser?.userId ? 'primary.50' : 'grey.50',
                          borderRadius: 1,
                          border: participant.owner?.userId === currentUser?.userId ? '2px solid' : '1px solid',
                          borderColor: participant.owner?.userId === currentUser?.userId ? 'primary.main' : 'grey.200'
                        }}
                      >
                        <Avatar
                          src={participant.pet?.profilePicture ? getProfilePictureUrl(participant.pet.profilePicture) : undefined}
                          sx={{ 
                            width: 50, 
                            height: 50,
                            bgcolor: participant.owner?.userId === currentUser?.userId ? 'primary.main' : 'secondary.main'
                          }}
                        >
                          {!participant.pet?.profilePicture && <Pets />}
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {participant.pet?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {participant.pet?.species} {participant.pet?.breed && `• ${participant.pet.breed}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Owner: {participant.owner?.firstName} {participant.owner?.lastName}
                            {participant.owner?.userId === currentUser?.userId && ' (You)'}
                          </Typography>
                        </Box>

                        {participant.hasApproved && (
                          <Chip
                            label="Approved"
                            color="success"
                            size="small"
                            icon={<CheckCircle />}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  justifyContent: { xs: 'center', sm: 'flex-end' },
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Tooltip title="View full wedding details">
                    <Button
                      variant="outline"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(wedding.postId!)}
                      sx={{ minWidth: '120px' }}
                    >
                      View Details
                    </Button>
                  </Tooltip>
                  
                  <Button
                    variant="primary"
                    size="small"
                    startIcon={<CheckCircle />}
                    onClick={() => handleResponse(wedding.postId!, 'approve')}
                    isLoading={actionLoading[wedding.postId!]}
                    loadingText="Approving..."
                    sx={{ 
                      minWidth: '120px',
                      bgcolor: 'success.main',
                      '&:hover': {
                        bgcolor: 'success.dark'
                      }
                    }}
                  >
                    Approve
                  </Button>
                  
                  <Button
                    variant="error"
                    size="small"
                    startIcon={<Cancel />}
                    onClick={() => handleResponse(wedding.postId!, 'decline')}
                    isLoading={actionLoading[wedding.postId!]}
                    loadingText="Declining..."
                    sx={{ minWidth: '120px' }}
                  >
                    Decline
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default WeddingRequests; 