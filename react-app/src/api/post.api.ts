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
    if (filters.region) params.append('region', filters.region);
    if (filters.district) params.append('district', filters.district);
    
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
    // Backend expects only the core Post properties, no navigation properties
    const updatePayload: any = {
      PostId: id, // Required: must match the ID in URL
      UserId: postData.userId, // Required: user ID
      PostType: postData.postType, // Required: post type
      Title: postData.title || '', // Required: title
      Content: postData.content || '', // Required: content
      Status: postData.status, // Required: preserve original status
      Images: postData.images || [], // List of image URLs
      Location: postData.location || null,
      Address: postData.address || null,
      Price: postData.price || null,
      EventDate: postData.eventDate || null,
      Category: postData.category || null,
      CreatedAt: postData.createdAt ? new Date(postData.createdAt).toISOString() : new Date().toISOString(), // Ensure proper ISO format
      UpdatedAt: new Date().toISOString() // Always update timestamp
    };

    // Include User object from original post data if available  
    if (postData.user) {
      // Convert frontend user object to backend format
      updatePayload.User = {
        UserId: postData.user.userId,
        Username: postData.user.username,
        Email: (postData.user as any).email || '',
        FirstName: postData.user.firstName || '',
        LastName: postData.user.lastName || '',
        Role: postData.user.role,
        IsActive: (postData.user as any).isActive ?? true,
        PasswordHash: (postData.user as any).passwordHash || '',
        Bio: (postData.user as any).bio || null,
        Location: postData.user.location || null,
        PhoneNumber: (postData.user as any).phoneNumber || null,
        ProfilePicture: postData.user.profilePicture || null,
        CreatedAt: (postData.user as any).createdAt || new Date().toISOString(),
        UpdatedAt: (postData.user as any).updatedAt || new Date().toISOString()
      };
    }

    // Remove other navigation properties that might cause issues
    delete updatePayload.PetWeddingParticipants;
    delete updatePayload.PostImages;
    delete updatePayload.ValidatedImages;

    // Ensure all required fields are present and valid
    if (!updatePayload.UserId) {
      throw new Error('UserId is required for post update');
    }
    if (updatePayload.PostType === undefined || updatePayload.PostType === null) {
      throw new Error('PostType is required for post update');
    }
    if (!updatePayload.Title) {
      throw new Error('Title is required for post update');
    }
    if (!updatePayload.Content) {
      throw new Error('Content is required for post update');
    }
    if (updatePayload.Status === undefined || updatePayload.Status === null) {
      throw new Error('Status is required for post update');
    }
    
    console.log('Final cleaned update payload:', updatePayload);
    console.log('Payload keys:', Object.keys(updatePayload));
    await postApi.put(`/posts/${id}`, updatePayload);
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
