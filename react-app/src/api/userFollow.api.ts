import axios from 'axios';
import type { 
  FollowStats, 
  FollowResponse, 
  IsFollowingResponse 
} from '../models/userFollow.types';
import type { User } from '../models/auth.types';

const API_BASE_URL = 'http://localhost:5295/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userFollowService = {
  // Follow a user
  async followUser(userId: number): Promise<FollowResponse> {
    const response = await api.post<FollowResponse>(`/userfollow/follow/${userId}`);
    return response.data;
  },

  // Unfollow a user
  async unfollowUser(userId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/userfollow/unfollow/${userId}`);
    return response.data;
  },

  // Check if following a user
  async isFollowing(userId: number): Promise<boolean> {
    const response = await api.get<IsFollowingResponse>(`/userfollow/is-following/${userId}`);
    return response.data.isFollowing;
  },

  // Get current user's followers
  async getMyFollowers(): Promise<User[]> {
    const response = await api.get<User[]>('/userfollow/followers');
    return response.data;
  },

  // Get current user's following
  async getMyFollowing(): Promise<User[]> {
    const response = await api.get<User[]>('/userfollow/following');
    return response.data;
  },

  // Get specific user's followers
  async getUserFollowers(userId: number): Promise<User[]> {
    const response = await api.get<User[]>(`/userfollow/followers/${userId}`);
    return response.data;
  },

  // Get specific user's following
  async getUserFollowing(userId: number): Promise<User[]> {
    const response = await api.get<User[]>(`/userfollow/following/${userId}`);
    return response.data;
  },

  // Get current user's follow stats
  async getMyFollowStats(): Promise<FollowStats> {
    const response = await api.get<FollowStats>('/userfollow/stats');
    return response.data;
  },

  // Get specific user's follow stats
  async getUserFollowStats(userId: number): Promise<FollowStats> {
    const response = await api.get<FollowStats>(`/userfollow/stats/${userId}`);
    return response.data;
  }
};
