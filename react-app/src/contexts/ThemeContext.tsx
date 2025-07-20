import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const getInitialTheme = (): ThemeMode => {
  try {
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch (error) {
    console.warn('Error reading theme from localStorage:', error);
  }
  
  // Check system preference as fallback
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

// Create theme based on mode
const createAppTheme = (mode: ThemeMode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#667eea' : '#8fa4f3',
        light: mode === 'light' ? '#9bb1ff' : '#b4c4f7',
        dark: mode === 'light' ? '#5a6fd8' : '#6b85e8',
      },
      secondary: {
        main: mode === 'light' ? '#764ba2' : '#9b6bc7',
        light: mode === 'light' ? '#a574d0' : '#b88dd3',
        dark: mode === 'light' ? '#6a4190' : '#7c5b9a',
      },
      background: {
        default: mode === 'light' ? '#ffffff' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#333333' : '#ffffff',
        secondary: mode === 'light' ? '#666666' : '#b3b3b3',
      },
      error: {
        main: mode === 'light' ? '#f44336' : '#ff6b6b',
      },
      warning: {
        main: mode === 'light' ? '#ff9800' : '#ffa726',
      },
      info: {
        main: mode === 'light' ? '#2196f3' : '#42a5f5',
      },
      success: {
        main: mode === 'light' ? '#4caf50' : '#66bb6a',
      },
    },
    typography: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#121212',
            color: mode === 'light' ? '#333333' : '#ffffff',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
            color: mode === 'light' ? '#333333' : '#ffffff',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
      },
    },
  });
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    try {
      localStorage.setItem('theme-mode', newMode);
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no manual preference is stored
      try {
        const savedTheme = localStorage.getItem('theme-mode');
        if (!savedTheme) {
          setMode(e.matches ? 'dark' : 'light');
        }
      } catch (error) {
        console.warn('Error reading theme from localStorage:', error);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = createAppTheme(mode);

  const value: ThemeContextType = {
    mode,
    toggleTheme,
    isDarkMode: mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 