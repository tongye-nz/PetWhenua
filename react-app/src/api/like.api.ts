import axios from 'axios';
import { API_CONFIG, addAuthInterceptor } from './config';
import type { 
  LikeRequest, 
  LikeResponse, 
  LikeStatus,
  LikeCountResponse,
  UserWhoLiked
} from '../models/like.types';

const likeApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Add auth token to requests
addAuthInterceptor(likeApi);

export const likeService = {
  // Like a post
  async likePost(request: LikeRequest): Promise<LikeResponse> {
    const response = await likeApi.post('/likes', request);
    return response.data;
  },

  // Unlike a post
  async unlikePost(postId: number, userId: number): Promise<LikeResponse> {
    const response = await likeApi.delete(`/likes/post/${postId}/user/${userId}`);
    return response.data;
  },

  // Toggle like status (like if not liked, unlike if liked)
  async toggleLike(request: LikeRequest): Promise<LikeResponse> {
    const response = await likeApi.post('/likes/toggle', request);
    return response.data;
  },

  // Get like count for a post
  async getLikeCount(postId: number): Promise<LikeCountResponse> {
    const response = await likeApi.get(`/likes/post/${postId}/count`);
    return response.data;
  },

  // Get like status for a user and post
  async getLikeStatus(postId: number, userId: number): Promise<LikeStatus> {
    const response = await likeApi.get(`/likes/post/${postId}/user/${userId}/status`);
    return response.data;
  },

  // Get users who liked a post
  async getUsersWhoLikedPost(postId: number): Promise<UserWhoLiked[]> {
    const response = await likeApi.get(`/likes/post/${postId}/users`);
    return response.data;
  }
}; 