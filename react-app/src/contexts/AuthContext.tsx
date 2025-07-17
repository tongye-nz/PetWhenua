import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/auth.api';
import type { User, AuthState, LoginRequest, RegisterRequest, ApiError } from '../models/auth.types';

// Authentication context type
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// Actions for auth reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return state;
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [error, setError] = React.useState<string | null>(null);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      setError(null);
      
      // Add timeout handling
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout. Please check your connection and try again.')), 30000);
      });
      
      const loginPromise = authService.login(credentials);
      const response = await Promise.race([loginPromise, timeoutPromise]) as any;
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Login failed. Please try again.';
      setError(errorMessage);
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw err;
    }
  };

  // Register function
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      setError(null);
      
      // Add timeout handling
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout. Please check your connection and try again.')), 30000);
      });
      
      const registerPromise = authService.register(userData);
      const response = await Promise.race([registerPromise, timeoutPromise]) as any;
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
    } catch (err) {
      console.error('Register error:', err);
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw err;
    }
  };

  // Logout function
  const logout = (): void => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
    setError(null);
  };

  // Check authentication status
  const checkAuth = async (): Promise<void> => {
    try {
      const storedToken = authService.getStoredToken();
      const storedUser = authService.getStoredUser();

      if (storedToken && storedUser) {
        // Verify token is still valid and get fresh user data
        try {
          const freshUserData = await authService.verifyToken();
          
          // Update localStorage with fresh user data
          localStorage.setItem('authUser', JSON.stringify(freshUserData));
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: freshUserData,
              token: storedToken,
            },
          });
        } catch {
          // Token is invalid, remove from storage
          authService.logout();
          dispatch({ type: 'LOGOUT' });
        }
      }
    } catch (err) {
      // Silent fail for auth check
      authService.logout();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function
  const clearError = (): void => {
    setError(null);
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 