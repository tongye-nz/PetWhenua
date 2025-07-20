import React from 'react';
import { Switch, FormControlLabel, Tooltip, styled, Box } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';

// Extract shared track styles
const trackStyles = {
  opacity: 1,
  backgroundColor: '#aab4be',
  borderRadius: 10,
};

const darkTrackStyles = {
  backgroundColor: '#8796A5',
};

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
        ...trackStyles,
        ...theme.applyStyles('dark', darkTrackStyles),
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
    ...trackStyles,
    ...theme.applyStyles('dark', darkTrackStyles),
  },
}));

// Extract shared icon container styles
const createIconBox = (backgroundColor: string, shadowIntensity: number) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  backgroundColor,
  borderRadius: '50%',
  boxShadow: `0 2px 8px rgba(0,0,0,${shadowIntensity})`,
});

// Icon component configuration
const iconConfig = {
  light: {
    backgroundColor: '#ffa000',
    shadowIntensity: 0.3,
    IconComponent: LightMode,
    iconColor: '#ffffff',
  },
  dark: {
    backgroundColor: '#003892',
    shadowIntensity: 0.5,
    IconComponent: DarkMode,
    iconColor: '#90caf9',
  },
};

interface ThemeToggleProps {
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabel = false
}) => {
  const { mode, toggleTheme, isDarkMode } = useTheme();

  // Factory function to create icon components
  const createIcon = (type: 'light' | 'dark') => {
    const config = iconConfig[type];
    const { IconComponent, iconColor, backgroundColor, shadowIntensity } = config;
    
    return (
      <Box sx={createIconBox(backgroundColor, shadowIntensity)}>
        <IconComponent sx={{
          fontSize: 18,
          color: iconColor
        }} />
      </Box>
    );
  };

  const switchControl = (
    <MaterialUISwitch
      checked={isDarkMode}
      onChange={toggleTheme}
      icon={createIcon('light')}
      checkedIcon={createIcon('dark')}
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