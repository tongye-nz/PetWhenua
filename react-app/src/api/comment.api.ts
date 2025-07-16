import axios from 'axios';
import { API_CONFIG, addAuthInterceptor } from './config';
import type { 
  Comment, 
  CreateCommentRequest, 
  UpdateCommentRequest,
  CommentResponse
} from '../models/comment.types';

const commentApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Add auth token to requests
addAuthInterceptor(commentApi);

export const commentService = {
  // Get comments for a post
  async getPostComments(postId: number): Promise<Comment[]> {
    const response = await commentApi.get(`/comments/post/${postId}`);
    return response.data;
  },

  // Create a new comment
  async createComment(request: CreateCommentRequest): Promise<CommentResponse> {
    const response = await commentApi.post('/comments', request);
    return response.data;
  },

  // Update a comment
  async updateComment(commentId: number, request: UpdateCommentRequest): Promise<void> {
    await commentApi.put(`/comments/${commentId}`, request);
  },

  // Delete a comment
  async deleteComment(commentId: number, userId: number): Promise<void> {
    await commentApi.delete(`/comments/${commentId}?userId=${userId}`);
  },

  // Get comment count for a post
  async getCommentCount(postId: number): Promise<number> {
    const response = await commentApi.get(`/comments/count/${postId}`);
    return response.data.count;
  }
}; 