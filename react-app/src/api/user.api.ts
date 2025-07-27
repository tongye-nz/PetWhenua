import axios, { AxiosError } from 'axios';
import type { User } from '../models/auth.types';
import { API_CONFIG } from './config';

// Create axios instance with base configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

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
  profilePicture?: string;
}

export interface AdminUserUpdateRequest {
  role?: string;
  isActive?: boolean;
}

export interface UserListResponse {
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface UpdateUserRoleResponse {
  userId: number;
  username: string;
  oldRole: string;
  newRole: string;
  updatedAt: string;
  message: string;
}

export interface UpdateUserStatusResponse {
  userId: number;
  username: string;
  oldStatus: boolean;
  newStatus: boolean;
  updatedAt: string;
  message: string;
}

export interface RoleOption {
  value: string;
  label: string;
  description: string;
}

export const userAPI = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await userApi.get('/users/me');
    return response.data;
  },

  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await userApi.get('/users');
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
  },

  // Admin operations
  
  // Get all users for admin dashboard
  getAllUsersForAdmin: async (): Promise<UserListResponse[]> => {
    const response = await userApi.get('/users/admin');
    return response.data;
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (userId: number, isActive: boolean): Promise<UpdateUserStatusResponse> => {
    const response = await userApi.patch(`/users/admin/${userId}/status`, { isActive });
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: number, role: string): Promise<UpdateUserRoleResponse> => {
    const response = await userApi.patch(`/users/admin/${userId}/role`, { role });
    return response.data;
  },

  // Get available roles for admin
  getAvailableRoles: async (): Promise<RoleOption[]> => {
    const response = await userApi.get('/users/admin/roles');
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId: number): Promise<{ message: string }> => {
    // Backend endpoint not implemented yet - userId would be used when implemented
    console.log(`User deletion requested for userId: ${userId}`);
    throw new Error('User deletion not yet implemented on backend. Please implement DELETE /admin/users/{id} endpoint.');
  }
};
