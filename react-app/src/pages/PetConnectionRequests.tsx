import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Alert,
  IconButton,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  Check,
  Close,
  Pets,
  Message
} from '@mui/icons-material';
import { Button, Text, LoadingSpinner } from '../components/ui';
import { petConnectionService } from '../api/petConnection.api';
import type { PetConnection } from '../models/petConnection.types';
import { PetConnectionStatus } from '../models/petConnection.types';
import { getProfilePictureUrl } from '../utils/imageUrlUtils';

const PetConnectionRequests: React.FC = () => {
  const navigate = useNavigate();

  const [connections, setConnections] = useState<PetConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const pendingConnections = await petConnectionService.getPendingConnections();
      setConnections(pendingConnections);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
      setError('Failed to load connection requests');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (connectionId: number, response: typeof PetConnectionStatus.Accepted | typeof PetConnectionStatus.Rejected, message?: string) => {
    try {
      setProcessingId(connectionId);
      setError(null);
      setSuccess(null);

      // Convert string enum values to integers for ASP.NET Core
      const enumToInt = {
        'Pending': 0,
        'Accepted': 1,
        'Rejected': 2,
        'Blocked': 3
      };

      const requestData = {
        response: enumToInt[response as keyof typeof enumToInt],
        message
      };

      console.log('Sending response to connection:', {
        connectionId,
        requestData,
        originalResponse: response,
        convertedResponse: requestData.response
      });

      await petConnectionService.respondToConnection(connectionId, requestData as any);

      // Remove the processed connection from the list
      setConnections(prev => prev.filter(conn => conn.petConnectionId !== connectionId));
      
      setSuccess(response === PetConnectionStatus.Accepted 
        ? 'Connection request accepted successfully!' 
        : 'Connection request declined.'
      );

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to respond to connection:', err);
      
      // Enhanced error logging
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as any;
        console.error('Response data:', axiosError.response?.data);
        console.error('Response status:', axiosError.response?.status);
        console.error('Response headers:', axiosError.response?.headers);
        
        // Log validation errors specifically
        if (axiosError.response?.data?.errors) {
          console.error('Validation errors:', axiosError.response.data.errors);
          
          // Extract specific validation error messages
          const errors = axiosError.response.data.errors;
          const errorMessages = Object.keys(errors).map(key => 
            `${key}: ${Array.isArray(errors[key]) ? errors[key].join(', ') : errors[key]}`
          );
          setError(`Validation failed: ${errorMessages.join('; ')}`);
          return;
        }
        
        // Show the backend error message if available
        const backendMessage = axiosError.response?.data?.message || axiosError.response?.data;
        if (typeof backendMessage === 'string') {
          setError(backendMessage);
          return;
        }
      }
      
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAccept = (connectionId: number) => {
    handleResponse(connectionId, PetConnectionStatus.Accepted);
  };

  const handleDecline = (connectionId: number) => {
    handleResponse(connectionId, PetConnectionStatus.Rejected);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <LoadingSpinner size="large" />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Text variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            Connection Requests
          </Text>
          <Text variant="body2" color="text.secondary">
            Manage pending pet connection requests
          </Text>
        </Box>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Connection Requests List */}
      {connections.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Pets sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Text variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
            No Pending Requests
          </Text>
          <Text variant="body2" color="text.secondary">
            You don't have any pending connection requests at the moment.
          </Text>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {connections.map((connection) => {
            // Determine which pet is the requesting pet and which is the target pet
            // The requesting pet belongs to the requestedBy user
            // The target pet belongs to the current user
            const isRequestingPet1 = connection.pet1?.user?.userId === connection.requestedById;
            const requestingPet = isRequestingPet1 ? connection.pet1 : connection.pet2;
            const targetPet = isRequestingPet1 ? connection.pet2 : connection.pet1;

            return (
              <Card key={connection.petConnectionId} sx={{ overflow: 'visible' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Requesting Pet (Left Side) */}
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33%' }, minWidth: 200 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={getProfilePictureUrl(requestingPet?.profilePicture)}
                          sx={{ 
                            width: 60, 
                            height: 60,
                            bgcolor: 'primary.main'
                          }}
                        >
                          {!requestingPet?.profilePicture && requestingPet?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {requestingPet?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {requestingPet?.species} • {requestingPet?.breed}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Owner: {connection.requestedBy?.firstName} {connection.requestedBy?.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Arrow/Connection Indicator */}
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' }, minWidth: 120 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: { xs: 'row', sm: 'column' }
                      }}>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                          wants to connect with
                        </Typography>
                      </Box>
                    </Box>

                    {/* Target Pet (Right Side - Your Pet) */}
                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33%' }, minWidth: 200 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={getProfilePictureUrl(targetPet?.profilePicture)}
                          sx={{ 
                            width: 60, 
                            height: 60,
                            bgcolor: 'secondary.main'
                          }}
                        >
                          {!targetPet?.profilePicture && targetPet?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {targetPet?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {targetPet?.species} • {targetPet?.breed}
                          </Typography>
                          <Chip 
                            label="Your Pet" 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                    </Box>

                  {/* Action Buttons */}
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' }, minWidth: 150 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1,
                      justifyContent: { xs: 'center', sm: 'flex-end' },
                      flexDirection: { xs: 'row', sm: 'column' }
                    }}>
                      <Button
                        variant="primary"
                        size="small"
                        startIcon={<Check />}
                        onClick={() => handleAccept(connection.petConnectionId)}
                        disabled={processingId === connection.petConnectionId}
                        sx={{ minWidth: '120px' }}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        startIcon={<Close />}
                        onClick={() => handleDecline(connection.petConnectionId)}
                        disabled={processingId === connection.petConnectionId}
                        sx={{ minWidth: '120px' }}
                      >
                        Decline
                      </Button>
                    </Box>
                  </Box>
                </Box>

                {/* Message Section */}
                {connection.requestMessage && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Message sx={{ color: 'text.secondary', fontSize: 18, mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Message from {connection.requestedBy?.firstName}:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          "{connection.requestMessage}"
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}

                {/* Request Date */}
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    Request sent: {new Date(connection.requestedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
};

export default PetConnectionRequests; 