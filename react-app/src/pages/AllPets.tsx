import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Typography
} from '@mui/material';
import { Pets as PetsIcon } from '@mui/icons-material';
import { Text, LoadingSpinner } from '../components/ui';
import { PetsGrid } from '../components/features/pets';
import { petService } from '../api/pet.api';
import type { Pet, PetFilters } from '../models/pet.types';

const AllPets: React.FC = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [availableSpecies, setAvailableSpecies] = useState<string[]>([]);

  // Load all pets
  const loadPets = async (filters?: PetFilters) => {
    try {
      setLoading(true);
      setError(null);
      const allPets = await petService.getPets({ includeUser: true, ...filters });
      setPets(allPets);
      
      // Extract unique species for filter dropdown
      const species = [...new Set(allPets
        .map(pet => pet.species)
        .filter((species): species is string => species !== undefined && species.trim() !== '')
      )].sort();
      setAvailableSpecies(species);
      
    } catch (err) {
      console.error('Failed to load pets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  // Handle species filter change
  const handleSpeciesFilterChange = (species: string) => {
    setSpeciesFilter(species);
    if (species) {
      // Filter pets by species on the client side for better performance
      const filtered = pets.filter(pet => 
        pet.species?.toLowerCase() === species.toLowerCase()
      );
      setPets(filtered);
    } else {
      // Reload all pets when filter is cleared
      loadPets();
    }
  };

  // Handle pet view
  const handleViewPet = (pet: Pet) => {
    if (pet.petId) {
      navigate(`/pet/${pet.petId}`);
    }
  };

  // Get pets filtered by current user (for demonstration)
  const getFilteredPets = () => {
    // You can add more complex filtering logic here
    return pets;
  };

  const filteredPets = getFilteredPets();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <PetsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Text variant="h4" component="h1">
            Discover Pets
          </Text>
        </Box>
        <Text variant="body1" color="text.secondary">
          Browse and connect with pets in your community
        </Text>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Text variant="h6" sx={{ mr: 2 }}>
            Filters:
          </Text>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Species</InputLabel>
            <Select
              value={speciesFilter}
              label="Species"
              onChange={(e) => handleSpeciesFilterChange(e.target.value)}
            >
              <MenuItem value="">
                <em>All Species</em>
              </MenuItem>
              {availableSpecies.map((species) => (
                <MenuItem key={species} value={species}>
                  {species}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Text variant="body2" color="text.secondary">
              Showing {filteredPets.length} pet{filteredPets.length !== 1 ? 's' : ''}
            </Text>
          </Box>
        </Box>
      </Paper>

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

      {/* Empty State */}
      {!loading && filteredPets.length === 0 && !error && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2
          }}
        >
          <PetsIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Text variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            {speciesFilter ? `No ${speciesFilter.toLowerCase()} pets found` : 'No pets found'}
          </Text>
          <Text variant="body1" color="text.secondary">
            {speciesFilter 
              ? `Try selecting a different species or clear the filter.`
              : 'Be the first to add pets to the community!'
            }
          </Text>
        </Box>
      )}

      {/* Pets Grid */}
      {!loading && filteredPets.length > 0 && (
        <PetsGrid
          pets={filteredPets}
          onViewPet={handleViewPet}
          onEditPet={() => {}} // Not allowed for other users' pets
          onDeletePet={() => {}} // Not allowed for other users' pets
        />
      )}

      {/* Info Box */}
      {!loading && filteredPets.length > 0 && (
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'primary.50' }}>
          <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
            Connect with Pet Owners
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click on any pet card to view detailed information and connect with their owners. 
            Build friendships in your local pet community!
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default AllPets;
