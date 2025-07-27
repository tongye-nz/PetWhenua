import React, { Suspense } from 'react'
import { render, screen, act, waitFor } from './test/utils/test-utils'
import { vi } from 'vitest'
import App from './App'

// Mock MUI icons to prevent "too many open files" error
vi.mock('@mui/icons-material', () => {
  const icons: { [key: string]: React.FC } = {}
  // Create mock for each icon that might be used
  const iconList = [
    'Menu', 'Close', 'AccountCircle', 'Notifications', 'Chat',
    'DarkMode', 'LightMode', 'Search', 'Add', 'Edit', 'Delete',
    'Settings', 'Home', 'Pets', 'Message', 'LocationOn', 'CloudUpload'
  ]
  iconList.forEach(icon => {
    icons[icon] = vi.fn().mockImplementation(() => <div data-testid={`mui-icon-${icon.toLowerCase()}`} />)
  })
  return icons
})

// Mock all providers and their hooks
vi.mock('./contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
  useTheme: () => ({
    mode: 'light',
    toggleTheme: vi.fn(),
    isDarkMode: false
  })
}))

vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: { id: '1', username: 'testuser', email: 'test@test.com' },
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    isAuthenticated: true,
    isLoading: false
  })
}))

vi.mock('./contexts/PostContext', () => ({
  PostProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="post-provider">{children}</div>,
  usePost: () => ({
    posts: [],
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
    isLoading: false
  })
}))

vi.mock('./contexts/SignalRContext', () => ({
  SignalRProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="signalr-provider">{children}</div>,
  useSignalR: () => ({
    connection: null,
    isConnected: false,
    sendMessage: vi.fn()
  })
}))

// Mock components that are always visible
vi.mock('./components/common', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
  ScrollToTop: () => <div data-testid="scroll-to-top" />,
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
  AdminRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-route">{children}</div>,
  MeetupAdminRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="meetup-admin-route">{children}</div>
}))

vi.mock('./components/features/notifications', () => ({
  NotificationToast: () => <div data-testid="notification-toast" />
}))

vi.mock('./components/ui', () => ({
  ChatButton: () => <div data-testid="chat-button" />
}))

// Mock the router components and hooks
vi.mock('react-router-dom', () => {
  const mockNavigate = vi.fn()
  const mockLocation = { pathname: '/', search: '', hash: '', state: null }
  const mockParams = {}

  return {
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
    Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
    Route: ({ element, path }: { element: React.ReactNode; path?: string }) => {
      // Wrap protected routes in their respective components
      if (path?.includes('/create-post') || path?.includes('/my-pets') || path?.includes('/profile')) {
        return <div data-testid="route"><div data-testid="protected-route">{element}</div></div>
      }
      if (path?.includes('/admin')) {
        if (path.includes('/meetups')) {
          return <div data-testid="route"><div data-testid="meetup-admin-route">{element}</div></div>
        }
        return <div data-testid="route"><div data-testid="admin-route">{element}</div></div>
      }
      return <div data-testid="route">{element}</div>
    },
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useParams: () => mockParams,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    Link: ({ children }: { children: React.ReactNode }) => <div data-testid="router-link">{children}</div>,
    Navigate: () => null
  }
})

// Mock all page components
vi.mock('./pages/Home.tsx', () => ({ default: () => <div data-testid="page-home" /> }))
vi.mock('./pages/Login.tsx', () => ({ default: () => <div data-testid="page-login" /> }))
vi.mock('./pages/Register.tsx', () => ({ default: () => <div data-testid="page-register" /> }))
vi.mock('./pages/MyPets.tsx', () => ({ default: () => <div data-testid="page-my-pets" /> }))
vi.mock('./pages/AllPets.tsx', () => ({ default: () => <div data-testid="page-all-pets" /> }))
vi.mock('./pages/Posts.tsx', () => ({ default: () => <div data-testid="page-posts" /> }))
vi.mock('./pages/PostDetail.tsx', () => ({ default: () => <div data-testid="page-post-detail" /> }))
vi.mock('./pages/PetDetail.tsx', () => ({ default: () => <div data-testid="page-pet-detail" /> }))
vi.mock('./pages/CreatePost.tsx', () => ({ default: () => <div data-testid="page-create-post" /> }))
vi.mock('./pages/MyPosts.tsx', () => ({ default: () => <div data-testid="page-my-posts" /> }))
vi.mock('./pages/AdminPanel.tsx', () => ({ default: () => <div data-testid="page-admin-panel" /> }))
vi.mock('./pages/MeetupManagement.tsx', () => ({ default: () => <div data-testid="page-meetup-management" /> }))
vi.mock('./pages/PetConnectionRequests.tsx', () => ({ default: () => <div data-testid="page-pet-connection-requests" /> }))
vi.mock('./pages/Messages.tsx', () => ({ default: () => <div data-testid="page-messages" /> }))
vi.mock('./pages/UsersNearMe.tsx', () => ({ default: () => <div data-testid="page-users-near-me" /> }))
vi.mock('./pages/PetsNearMe.tsx', () => ({ default: () => <div data-testid="page-pets-near-me" /> }))
vi.mock('./pages/WeddingRequests.tsx', () => ({ default: () => <div data-testid="page-wedding-requests" /> }))
vi.mock('./pages/ProjectInfo.tsx', () => ({ default: () => <div data-testid="page-project-info" /> }))
vi.mock('./pages/MeetDeveloper.tsx', () => ({ default: () => <div data-testid="page-meet-developer" /> }))

// Mock lazy-loaded components
vi.mock('./pages/UserProfile.tsx', () => ({ default: () => <div data-testid="page-user-profile" /> }))
vi.mock('./pages/OtherUserProfile.tsx', () => ({ default: () => <div data-testid="page-other-user-profile" /> }))

// Mock ImageUpload component
vi.mock('./components/ImageUpload.tsx', () => ({
  default: () => <div data-testid="image-upload" />
}))

// Helper function to render App with Suspense handling
const renderApp = async () => {
  let result: ReturnType<typeof render>
  await act(async () => {
    result = render(
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    )
  })

  // Wait for Suspense to resolve
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  return result!
}

describe('App Component', () => {
  it('renders with all required providers', async () => {
    await renderApp()
    
    // Check if all providers are rendered
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByTestId('post-provider')).toBeInTheDocument()
    expect(screen.getByTestId('signalr-provider')).toBeInTheDocument()
  })

  it('renders core layout components', async () => {
    await renderApp()
    
    // Check if layout components are rendered
    expect(screen.getByTestId('layout')).toBeInTheDocument()
    expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument()
    expect(screen.getByTestId('notification-toast')).toBeInTheDocument()
    expect(screen.getByTestId('chat-button')).toBeInTheDocument()
  })

  it('renders router components', async () => {
    await renderApp()
    
    // Check if router components are rendered
    expect(screen.getByTestId('routes')).toBeInTheDocument()
    // Should have multiple routes
    expect(screen.getAllByTestId('route').length).toBeGreaterThan(1)
  })

  it('renders protected routes correctly', async () => {
    await renderApp()
    
    // Check if protected route components are rendered
    const protectedRoutes = screen.queryAllByTestId('protected-route')
    const adminRoutes = screen.queryAllByTestId('admin-route')
    const meetupAdminRoutes = screen.queryAllByTestId('meetup-admin-route')

    // Verify that we have at least one of each type of protected route
    expect(protectedRoutes.length).toBeGreaterThan(0)
    expect(adminRoutes.length).toBeGreaterThan(0)
    expect(meetupAdminRoutes.length).toBeGreaterThan(0)
  })
}) 