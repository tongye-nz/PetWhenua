import axios, { AxiosError } from 'axios';
import type { User } from '../models/auth.types';

// Create axios instance with base configuration
const API_BASE_URL = 'http://localhost:5295/api';

const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
userApi.interceptors.response.use(
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

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
}

export const userAPI = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await userApi.get('/users/me');
    return response.data;
  },

  // Update current user profile
  updateCurrentUser: async (updateData: UpdateUserProfileRequest): Promise<User> => {
    const response = await userApi.put('/users/me', updateData);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await userApi.get(`/users/${id}`);
    return response.data;
  }
};
