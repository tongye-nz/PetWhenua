import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { AuthProvider } from '../src/contexts/AuthContext';

// Create light and dark themes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

// Simple Error Boundary Component
class StorybookErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Storybook component error (likely API-related):', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {
          padding: '20px',
          border: '2px dashed #orange',
          borderRadius: '8px',
          backgroundColor: '#fff3cd',
          color: '#856404',
        }
      }, [
        React.createElement('h3', { key: 'title' }, '⚠️ Component Error'),
        React.createElement('p', { key: 'msg' }, 'This component failed to render, likely due to missing API context.'),
        React.createElement('p', { key: 'note' }, 'Error: ', this.state.error?.message || 'Unknown error'),
        React.createElement('small', { key: 'help' }, 'This is normal in Storybook for components that depend on external APIs.')
      ]);
    }

    return this.props.children;
  }
}

// Mock API services globally
const mockAuthService = {
  login: () => Promise.resolve({ user: { userId: 1, username: 'testuser' }, token: 'mock-token' }),
  register: () => Promise.resolve({ user: { userId: 1, username: 'testuser' }, token: 'mock-token' }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  },
  getStoredToken: () => typeof window !== 'undefined' ? localStorage.getItem('authToken') : 'mock-token',
  getStoredUser: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('authUser');
      return stored ? JSON.parse(stored) : null;
    }
    return { userId: 1, username: 'testuser' };
  },
  verifyToken: () => Promise.resolve({ userId: 1, username: 'testuser' }),
};

const mockLikeService = {
  getLikeStatus: () => Promise.resolve({ isLiked: false, likeCount: 5 }),
  toggleLike: () => Promise.resolve({ isLiked: true, likeCount: 6 }),
};

const mockChatService = {
  getUnreadCount: () => Promise.resolve(3),
};

// Add global mocks
declare global {
  interface Window {
    mockAuthService: typeof mockAuthService;
    mockLikeService: typeof mockLikeService;
    mockChatService: typeof mockChatService;
  }
}

if (typeof window !== 'undefined') {
  window.mockAuthService = mockAuthService;
  window.mockLikeService = mockLikeService;
  window.mockChatService = mockChatService;
}

// Global decorators
const withErrorBoundary = (Story: React.ComponentType) => {
  return React.createElement(StorybookErrorBoundary, { children: React.createElement(Story) });
};

const withMockAuth = (Story: React.ComponentType) => {
  // Pre-populate localStorage with mock auth data
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', 'mock-token');
    localStorage.setItem('authUser', JSON.stringify({ userId: 1, username: 'testuser' }));
  }

  return React.createElement(AuthProvider, { children: React.createElement(Story) });
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    withErrorBoundary,
    withMockAuth,
    withThemeFromJSXProvider({
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      defaultTheme: 'light',
      Provider: ThemeProvider,
      GlobalStyles: CssBaseline,
    }),
  ],
};

export default preview;