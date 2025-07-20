import React from 'react';
import { Switch, FormControlLabel, Tooltip, styled, Box } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
        ...theme.applyStyles('dark', {
          backgroundColor: '#8796A5',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: 'transparent',
    width: 32,
    height: 32,
    border: 'none',
    boxShadow: 'none',
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
    ...theme.applyStyles('dark', {
      backgroundColor: '#8796A5',
    }),
  },
}));

interface ThemeToggleProps {
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showLabel = false
}) => {
  const { mode, toggleTheme, isDarkMode } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  const switchControl = (
    <MaterialUISwitch
      checked={isDarkMode}
      onChange={handleToggle}
      icon={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            backgroundColor: '#001e3c',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <LightMode sx={{ 
            fontSize: 18, 
            color: '#ffa726'
          }} />
        </Box>
      }
      checkedIcon={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            backgroundColor: '#003892',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <DarkMode sx={{ 
            fontSize: 18, 
            color: '#90caf9'
          }} />
        </Box>
      }
    />
  );

  if (showLabel) {
    return (
      <FormControlLabel
        control={switchControl}
        label={`${mode === 'light' ? 'Light' : 'Dark'} Mode`}
        labelPlacement="start"
        sx={{
          margin: 0,
          '& .MuiFormControlLabel-label': {
            fontSize: '1rem',
            fontWeight: 500,
          },
        }}
      />
    );
  }

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`} arrow>
      {switchControl}
    </Tooltip>
  );
};

export default ThemeToggle; 