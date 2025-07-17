import axios, { AxiosError } from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse, User, ApiError } from '../models/auth.types';

// Create axios instance with base configuration
const API_BASE_URL = 'http://localhost:5295/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
authApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register');
    
    // Only redirect to login if it's a 401 on a protected endpoint (not auth endpoints)
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Token expired or invalid on protected route
      console.warn('Authentication token expired or invalid. Redirecting to login.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleApiError = (error: AxiosError): ApiError => {
  if (error.response?.data) {
    const data = error.response.data as any;
    
    // Handle validation errors
    if (data.errors) {
      const validationMessages = Object.values(data.errors).flat().join(', ');
      return {
        message: validationMessages || 'Validation failed',
        errors: data.errors
      };
    }
    
    // Handle specific error messages from server - prioritize server messages
    if (data.message) {
      return { message: data.message };
    }
    
    // Handle string error messages
    if (typeof data === 'string') {
      return { message: data };
    }
  }
  
  // Handle network and other specific errors
  if (!error.response) {
    return {
      message: 'Network error. Please check your internet connection and try again.'
    };
  }
  
  // Handle specific HTTP status codes - only use fallback messages if no server message
  switch (error.response.status) {
    case 400:
      return { message: 'Invalid request. Please check your input and try again.' };
    case 401:
      // For 401, try to extract server message first, fallback to generic message
      const unauthorizedMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : (error.response.data as any)?.message || 'Invalid username/email or password. Please try again.';
      return { message: unauthorizedMessage };
    case 403:
      return { message: 'You do not have permission to perform this action.' };
    case 404:
      return { message: 'Service not found. Please try again later.' };
    case 429:
      return { message: 'Too many attempts. Please wait a moment and try again.' };
    case 500:
      return { message: 'Server error. Please try again later.' };
    case 502:
    case 503:
    case 504:
      return { message: 'Service temporarily unavailable. Please try again later.' };
    default:
      return {
        message: error.message || 'An unexpected error occurred. Please try again.'
      };
  }
};

// Authentication API functions
export const authService = {
  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post<AuthResponse>('/auth/register', userData);
      
      // Store token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('authUser', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post<AuthResponse>('/auth/login', credentials);
      
      // Store token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('authUser', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Verify token
  async verifyToken(): Promise<User> {
    try {
      const response = await authApi.post<User>('/auth/verify-token');
      return response.data;
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  },

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('authUser');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }
}; 