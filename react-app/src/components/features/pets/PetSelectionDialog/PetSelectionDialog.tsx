import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Alert,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl
} from '@mui/material';
import { Pets, Close } from '@mui/icons-material';
import { LoadingSpinner } from '../../../ui';
import { petService } from '../../../../api/pet.api';
import { petConnectionService } from '../../../../api/petConnection.api';
import { useAuth } from '../../../../contexts/AuthContext';
import type { Pet } from '../../../../models/pet.types';

export interface PetSelectionDialogProps {
  open: boolean;
  targetPet: Pet;
  onClose: () => void;
  onConnectionRequested: () => void;
}

const PetSelectionDialog: React.FC<PetSelectionDialogProps> = ({
  open,
  targetPet,
  onClose,
  onConnectionRequested
}) => {
  const { user } = useAuth();
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's pets when dialog opens
  useEffect(() => {
    if (open && user?.userId) {
      loadMyPets();
    }
  }, [open, user?.userId]);

  const loadMyPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const pets = await petService.getPets({ userId: user?.userId });
      setMyPets(pets);
      
      // Auto-select first pet if only one pet
      if (pets.length === 1) {
        setSelectedPetId(pets[0].petId!);
      }
    } catch (err) {
      console.error('Failed to load pets:', err);
      setError('Failed to load your pets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPetId) {
      setError('Please select a pet to connect');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await petConnectionService.requestConnection({
        pet1Id: selectedPetId,
        pet2Id: targetPet.petId!,
        message: message || `${myPets.find(p => p.petId === selectedPetId)?.name} would like to connect with ${targetPet.name}!`
      });

      onConnectionRequested();
      handleClose();
    } catch (err) {
      console.error('Failed to request connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to send connection request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedPetId(null);
    setMessage('');
    setError(null);
    onClose();
  };

  const selectedPet = myPets.find(pet => pet.petId === selectedPetId);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Pets color="primary" />
        Connect with {targetPet.name}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Choose which of your pets you'd like to connect with {targetPet.name}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <LoadingSpinner />
          </Box>
        ) : myPets.length === 0 ? (
          <Alert severity="info">
            You need to add pets to your profile before you can connect with other pets.
          </Alert>
        ) : (
          <>
            {/* Pet Selection */}
            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
              <RadioGroup
                value={selectedPetId || ''}
                onChange={(e) => setSelectedPetId(Number(e.target.value))}
              >
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 2
                }}>
                  {myPets.map((pet) => (
                    <Card 
                      key={pet.petId}
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedPetId === pet.petId ? 2 : 1,
                        borderColor: selectedPetId === pet.petId ? 'primary.main' : 'divider',
                        '&:hover': {
                          borderColor: 'primary.light'
                        }
                      }}
                      onClick={() => setSelectedPetId(pet.petId!)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                        <FormControlLabel
                          value={pet.petId}
                          control={<Radio />}
                          label=""
                          sx={{ m: 0, mr: 1 }}
                        />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          {pet.profilePicture ? (
                            <CardMedia
                              component="img"
                              image={pet.profilePicture}
                              alt={pet.name}
                              sx={{ 
                                width: 60, 
                                height: 60, 
                                objectFit: 'cover',
                                borderRadius: 1,
                                mr: 2
                              }}
                            />
                          ) : (
                            <Box sx={{
                              width: 60,
                              height: 60,
                              bgcolor: 'grey.200',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 1,
                              mr: 2
                            }}>
                              <Pets sx={{ color: 'grey.400' }} />
                            </Box>
                          )}
                          
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {pet.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {pet.species} • {pet.breed}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </RadioGroup>
            </FormControl>

            {/* Optional Message */}
            <TextField
              fullWidth
              label="Connection Message (Optional)"
              multiline
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={selectedPet ? `${selectedPet.name} would like to connect with ${targetPet.name}!` : 'Add a personal message...'}
              sx={{ mb: 2 }}
            />

            {/* Preview */}
            {selectedPet && (
              <Alert severity="info" sx={{ mt: 2 }}>
                You're about to send a connection request from <strong>{selectedPet.name}</strong> to <strong>{targetPet.name}</strong>
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedPetId || submitting || myPets.length === 0}
          startIcon={submitting ? <LoadingSpinner size="small" /> : <Pets />}
        >
          {submitting ? 'Sending Request...' : 'Send Connection Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PetSelectionDialog; 