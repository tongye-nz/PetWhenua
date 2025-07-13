import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  ClickAwayListener,
  Paper,
  MenuItem,
  Typography,
  Divider
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { parseLocation, combineLocation } from '../../../utils/locationUtils';

export interface LocationInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

interface LocationSuggestion {
  type: 'profile' | 'recent' | 'manual';
  label: string;
  value: string;
  icon?: React.ReactNode;
}

const LocationInput: React.FC<LocationInputProps> = ({
  label = "Location",
  value,
  onChange,
  disabled = false,
  placeholder = "Add location (optional)",
  error = false,
  helperText,
  fullWidth = true,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  // Generate suggestions when input is focused
  useEffect(() => {
    if (isOpen) {
      const newSuggestions: LocationSuggestion[] = [];

      // Add user's profile location if available and different from current value
      if (user?.location && user.location !== value) {
        const { region, district } = parseLocation(user.location);
        if (region || district) {
          const profileLocationLabel = combineLocation(region, district);
          newSuggestions.push({
            type: 'profile',
            label: `Use profile location (${profileLocationLabel})`,
            value: user.location,
            icon: <LocationOn color="action" />
          });
        }
      }

      // Add some recent/common locations (you could store these in localStorage)
      const recentLocations = getRecentLocations();
      recentLocations.forEach(location => {
        if (location !== value && !newSuggestions.some(s => s.value === location)) {
          newSuggestions.push({
            type: 'recent',
            label: location,
            value: location,
          });
        }
      });

      setSuggestions(newSuggestions);
    }
  }, [isOpen, user?.location, value]);

  const getRecentLocations = (): string[] => {
    try {
      const stored = localStorage.getItem('recentLocations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveToRecentLocations = (location: string) => {
    if (!location) return;
    
    try {
      const recent = getRecentLocations();
      const updated = [location, ...recent.filter(loc => loc !== location)].slice(0, 5);
      localStorage.setItem('recentLocations', JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const handleSuggestionClick = async (suggestion: LocationSuggestion) => {
    onChange(suggestion.value);
    saveToRecentLocations(suggestion.value);
    setIsOpen(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box position="relative" width={fullWidth ? "100%" : "auto"}>
        <TextField
          ref={inputRef}
          label={label}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          fullWidth={fullWidth}
        />
        
        {isOpen && suggestions.length > 0 && (
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1300,
              maxHeight: '200px',
              overflowY: 'auto',
              mt: 0.5,
            }}
          >
            {suggestions.map((suggestion, index) => (
              <React.Fragment key={`${suggestion.type}-${index}`}>
                <MenuItem
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1.5,
                  }}
                >
                  {suggestion.icon}
                  <Box>
                    <Typography variant="body2">
                      {suggestion.label}
                    </Typography>
                    {suggestion.type === 'profile' && (
                      <Typography variant="caption" color="text.secondary">
                        From your profile
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
                {index === 0 && suggestions.length > 1 && <Divider />}
              </React.Fragment>
            ))}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default LocationInput;
