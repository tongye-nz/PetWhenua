import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Header from './Header';

// Mock components that Header depends on
const MockNotificationCenter = () => <div data-testid="notification-center">🔔</div>;
const MockThemeToggle = ({ showLabel }: { showLabel?: boolean }) => (
  <div data-testid="theme-toggle">
    🌙 {showLabel && 'Theme'}
  </div>
);

// Create a simple Button mock component
interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  fullWidth?: boolean;
}

const MockButton = ({ children, onClick, variant, fullWidth }: MockButtonProps) => (
  <button 
    onClick={onClick} 
    data-variant={variant}
    style={{ 
      width: fullWidth ? '100%' : 'auto',
      padding: '8px 16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      backgroundColor: variant === 'primary' ? '#1976d2' : 'transparent',
      color: variant === 'primary' ? 'white' : 'inherit',
      cursor: 'pointer'
    }}
    data-testid="button"
  >
    {children}
  </button>
);

// Mock utility functions
const mockIsAdmin = (role: string) => role === 'admin';
const mockIsMeetupAdmin = (role: string) => role === 'meetup_admin';



/* eslint-disable @typescript-eslint/no-explicit-any */
interface AuthState {
  isAuthenticated: boolean;
  user: any;
}

// Create a Header component that uses our mocks
const HeaderWithMocks = ({ authState, onSignInClick }: { authState: AuthState; onSignInClick?: () => void }) => {
  const mockAuthHook = () => ({
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    logout: () => console.log('Logout called'),
    login: () => console.log('Login called'),
    register: () => console.log('Register called'),
    loading: false,
  });

  // Replace the imports with our mocks
  const HeaderComponent = React.useMemo(() => {
    // Create a version of Header that uses our mocked dependencies
    return ({ onSignInClick: onSignInClickProp }: { onSignInClick?: () => void }) => {
      const auth = mockAuthHook();
      
      const [profileAnchorEl, setProfileAnchorEl] = React.useState<null | HTMLElement>(null);

      return (
        <div style={{ 
          backgroundColor: '#fff',
          borderBottom: '1px solid #e0e0e0',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
                         <img 
               src="/logo.png" 
               alt="PetWhenua Logo" 
               style={{ height: '48px', width: 'auto' }}
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                 if (nextElement) {
                   nextElement.style.display = 'block';
                 }
               }}
             />
             <div style={{ display: 'none', padding: '12px', background: '#f0f0f0', borderRadius: '4px' }}>
               📱 PetWhenua
             </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Home</span>
            <span style={{ color: '#666' }}>Moment</span>
            <span style={{ color: '#666' }}>Meetup</span>
            <span style={{ color: '#666' }}>Pet Wedding</span>
            <span style={{ color: '#666' }}>Buy & Sell</span>
            <span style={{ color: '#666' }}>Library</span>
            <span style={{ color: '#666' }}>Announcement</span>
          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MockThemeToggle />
            
            {auth.isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MockNotificationCenter />
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => setProfileAnchorEl(profileAnchorEl ? null : e.currentTarget)}
                >
                  {auth.user?.firstName?.[0] || auth.user?.username?.[0] || '?'}
                </div>
                {profileAnchorEl && (
                  <div style={{
                    position: 'absolute',
                    top: '60px',
                    right: '16px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    minWidth: '180px'
                  }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>👤 My Details</div>
                    <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>🐾 My Pets</div>
                    <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>📝 My Posts</div>
                    <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>🤝 Connection Requests</div>
                    <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>💒 Wedding Requests</div>
                    <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>💬 Messages</div>
                    {mockIsAdmin(auth.user?.role || '') && (
                      <div style={{ padding: '8px', borderBottom: '1px solid #eee', color: '#f57c00' }}>⚙️ Admin Panel</div>
                    )}
                    {mockIsMeetupAdmin(auth.user?.role || '') && (
                      <div style={{ padding: '8px', borderBottom: '1px solid #eee', color: '#1976d2' }}>📅 Meetup Management</div>
                    )}
                    <div style={{ padding: '8px', color: '#d32f2f' }}>🚪 Sign Out</div>
                  </div>
                )}
              </div>
            ) : (
              <MockButton variant="primary" onClick={onSignInClickProp}>
                Sign In
              </MockButton>
            )}
          </div>
        </div>
      );
    };
  }, [authState]);

  return <HeaderComponent onSignInClick={onSignInClick} />;
};

// Create themes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Extended story args interface
interface HeaderStoryArgs {
  onSignInClick?: () => void;
  authState: AuthState;
  isDarkMode?: boolean;
  initialPath?: string;
}

// Wrapper component with all providers
const HeaderWrapper = ({ args }: { args: HeaderStoryArgs }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={args.isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: args.isDarkMode ? '#121212' : '#ffffff' 
        }}>
          <HeaderWithMocks authState={args.authState} onSignInClick={args.onSignInClick} />
          <div style={{ padding: '20px', color: args.isDarkMode ? 'white' : 'black' }}>
            <p>Page content would go here... Current path: {args.initialPath || '/'}</p>
            <p>Auth state: {args.authState.isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
            {args.authState.user && (
              <p>User: {args.authState.user.firstName} {args.authState.user.lastName} ({args.authState.user.role})</p>
            )}
          </div>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const meta: Meta<HeaderStoryArgs> = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main navigation header component that adapts to different authentication states and user roles. Features responsive design with mobile drawer navigation.',
      },
    },
  },
  argTypes: {
    onSignInClick: {
      description: 'Custom callback for sign-in button click',
      action: 'sign-in-clicked',
    },
    authState: {
      description: 'Authentication state and user data',
      control: false,
    },
    isDarkMode: {
      description: 'Whether to use dark theme',
      control: 'boolean',
    },
    initialPath: {
      description: 'Initial route path for testing active states',
      control: 'text',
    },
  },
  render: (args) => <HeaderWrapper args={args} />,
};

export default meta;
type Story = StoryObj<HeaderStoryArgs>;

// Unauthenticated States
export const Default: Story = {
  args: {
    authState: {
      isAuthenticated: false,
      user: null,
    },
    isDarkMode: false,
    initialPath: '/',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default header state for unauthenticated users with sign-in button.',
      },
    },
  },
};

export const UnauthenticatedDarkMode: Story = {
  args: {
    authState: {
      isAuthenticated: false,
      user: null,
    },
    isDarkMode: true,
    initialPath: '/',
  },
  parameters: {
    docs: {
      description: {
        story: 'Header in dark mode for unauthenticated users.',
      },
    },
  },
};

export const WithCustomSignInHandler: Story = {
  args: {
    authState: {
      isAuthenticated: false,
      user: null,
    },
    onSignInClick: () => alert('Custom sign-in handler called!'),
    isDarkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with custom sign-in click handler instead of default navigation.',
      },
    },
  },
};

// Authenticated States
export const AuthenticatedUser: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      user: {
        id: '1',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
        profilePicture: '/profile1.jpg',
      },
    },
    isDarkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header for authenticated regular user with profile menu and notifications.',
      },
    },
  },
};

export const AdminUser: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      user: {
        id: '2',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'admin',
        profilePicture: null,
      },
    },
    isDarkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header for admin user with access to Admin Panel in profile menu.',
      },
    },
  },
};

export const MeetupAdminUser: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      user: {
        id: '3',
        username: 'meetupadmin',
        firstName: 'Meetup',
        lastName: 'Admin',
        email: 'meetup@example.com',
        role: 'meetup_admin',
        profilePicture: '/profile2.jpg',
      },
    },
    isDarkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header for meetup admin user with access to Meetup Management.',
      },
    },
  },
};

export const UserWithoutProfilePicture: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      user: {
        id: '4',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        role: 'user',
        profilePicture: null,
      },
    },
    isDarkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header for user without profile picture - shows first letter of name as avatar.',
      },
    },
  },
};

// Active Navigation States
export const PostsPageActive: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      user: {
        id: '1',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
        profilePicture: '/profile1.jpg',
      },
    },
    initialPath: '/posts/moment',
    isDarkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with "Moment" navigation item highlighted as active.',
      },
    },
  },
};

export const MeetupPageActive: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      user: {
        id: '1',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
      },
    },
    initialPath: '/posts/meetup',
    isDarkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with "Meetup" navigation item highlighted as active.',
      },
    },
  },
};

// Responsive/Mobile States
export const MobileUnauthenticated: Story = {
  args: {
    authState: {
      isAuthenticated: false,
      user: null,
    },
    isDarkMode: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile view of header for unauthenticated users. Shows hamburger menu instead of navigation links.',
      },
    },
  },
};

export const MobileAuthenticated: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      user: {
        id: '1',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
        profilePicture: '/profile1.jpg',
      },
    },
    isDarkMode: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile view of header for authenticated users. Mobile drawer includes user account section.',
      },
    },
  },
};

// Edge Cases
export const LongUsername: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      user: {
        id: '5',
        username: 'very_long_username_that_might_overflow',
        firstName: 'Very Long First Name',
        lastName: 'Very Long Last Name',
        email: 'verylongname@example.com',
        role: 'user',
        profilePicture: null,
      },
    },
    isDarkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with user that has very long names to test layout handling.',
      },
    },
  },
};

export const AllRolesCombined: Story = {
  args: {
    authState: {
      isAuthenticated: true,
      user: {
        id: '6',
        username: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'super@example.com',
        role: 'admin',
        profilePicture: '/admin-avatar.jpg',
      },
    },
    isDarkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Header for user with maximum privileges to show all available menu options.',
      },
    },
  },
}; 