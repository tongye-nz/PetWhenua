import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const profileApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000, // 30 second timeout for file uploads
});

// Add auth token to requests
profileApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ProfilePictureUploadResult {
  profilePicture: string;
}

/**
 * Profile Picture API service for handling profile image uploads
 */
export const profilePictureService = {
  /**
   * Upload user profile picture
   */
  uploadUserProfilePicture: async (file: File): Promise<ProfilePictureUploadResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await profileApi.post<ProfilePictureUploadResult>(
        `${API_CONFIG.ENDPOINTS.USERS}/me/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('User profile picture upload failed:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data || error.message;
        throw new Error(`Failed to upload profile picture: ${errorMessage}`);
      }

      throw new Error('Unknown error occurred while uploading profile picture');
    }
  },

  /**
   * Upload pet profile picture
   */
  uploadPetProfilePicture: async (petId: number, file: File): Promise<ProfilePictureUploadResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await profileApi.post<ProfilePictureUploadResult>(
        `${API_CONFIG.ENDPOINTS.PETS}/${petId}/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Pet profile picture upload failed:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data || error.message;
        throw new Error(`Failed to upload pet profile picture: ${errorMessage}`);
      }

      throw new Error('Unknown error occurred while uploading pet profile picture');
    }
  },

  /**
   * Delete profile picture (user or pet)
   */
  deleteProfilePicture: async (imageUrl: string): Promise<boolean> => {
    try {
      // Use the existing image service delete endpoint
      const fileName = imageUrl.split('/').pop() || '';
      
      await profileApi.delete(`${API_CONFIG.ENDPOINTS.IMAGES}/${encodeURIComponent(fileName)}`);
      return true;
    } catch (error) {
      console.error('Profile picture deletion failed:', error);
      return false;
    }
  },
}; 