import axios from 'axios';
import { API_CONFIG, addAuthInterceptor } from './config';
import type { 
  Post, 
  CreatePostRequest, 
  UpdatePostStatusRequest, 
  PostFilters
} from '../models/post.types';

const postApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Add auth token to requests
addAuthInterceptor(postApi);

export const postService = {
  // Get all posts with optional filters
  async getPosts(filters: PostFilters = {}): Promise<Post[]> {
    const params = new URLSearchParams();
    if (filters.postType !== undefined) params.append('postType', filters.postType.toString());
    if (filters.userId) params.append('userId', filters.userId.toString());
    if (filters.status !== undefined) params.append('status', filters.status.toString());
    
    const response = await postApi.get(`/posts?${params.toString()}`);
    return response.data;
  },

  // Get single post by ID
  async getPost(id: number): Promise<Post> {
    const response = await postApi.get(`/posts/${id}`);
    return response.data;
  },

  // Create new post
  async createPost(postData: CreatePostRequest): Promise<Post> {
    const response = await postApi.post('/posts/with-role', postData);
    return response.data;
  },

  // Update post
  async updatePost(id: number, postData: Partial<Post>): Promise<void> {
    await postApi.put(`/posts/${id}`, postData);
  },

  // Delete post
  async deletePost(id: number): Promise<void> {
    await postApi.delete(`/posts/${id}`);
  },

  // Change post status
  async updatePostStatus(id: number, statusData: UpdatePostStatusRequest): Promise<Post> {
    const response = await postApi.put(`/posts/${id}/status`, statusData);
    return response.data;
  },

  // Get user's posts
  async getUserPosts(userId: number): Promise<Post[]> {
    const response = await postApi.get(`/posts/user/${userId}`);
    return response.data;
  },

  // Get posts by type
  async getPostsByType(postType: number): Promise<Post[]> {
    const response = await postApi.get(`/posts/type/${postType}`);
    return response.data;
  },

  // Get creation permissions for user role
  async getCreationPermissions(userRole: string): Promise<any> {
    const response = await postApi.get(`/posts/creation-permissions?userRole=${userRole}`);
    return response.data;
  },

  // Get available status transitions
  async getStatusTransitions(postId: number, userId: number, userRole: string): Promise<any> {
    const response = await postApi.get(
      `/posts/${postId}/status-transitions?userId=${userId}&userRole=${userRole}`
    );
    return response.data;
  }
};
