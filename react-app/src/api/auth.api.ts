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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
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
      return {
        message: 'Validation failed',
        errors: data.errors
      };
    }
    
    // Handle string error messages
    if (typeof data === 'string') {
      return { message: data };
    }
    
    // Handle object with message property
    if (data.message) {
      return { message: data.message };
    }
  }
  
  return {
    message: error.message || 'An unexpected error occurred'
  };
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