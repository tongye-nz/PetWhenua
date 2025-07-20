import axios from 'axios';
import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface ImageUploadResult {
  success: boolean;
  imageUrls: string[];
  uploadedCount: number;
  errorMessage?: string;
}

export interface ImageValidationResult {
  isValid: boolean;
  fileName?: string;
  fileSize: number;
  errorMessage?: string;
}

/**
 * Image API service for handling image uploads and management
 */
export const imageApi = {
  /**
   * Upload multiple images
   */
  uploadImages: async (
    files: File[], 
    userId: number, 
    postId?: number
  ): Promise<ImageUploadResult> => {
    try {
      const formData = new FormData();
      
      // Add files to form data
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      // Add metadata
      formData.append('userId', userId.toString());
      if (postId) {
        formData.append('postId', postId.toString());
      }

      const response = await axios.post<ImageUploadResult>(
        `${API_BASE_URL}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Image upload failed:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.errorMessage || error.message;
        return {
          success: false,
          imageUrls: [],
          uploadedCount: 0,
          errorMessage,
        };
      }

      return {
        success: false,
        imageUrls: [],
        uploadedCount: 0,
        errorMessage: 'Unknown upload error occurred',
      };
    }
  },

  /**
   * Delete a single image
   */
  deleteImage: async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop() || '';
      
      await axios.delete(`${API_BASE_URL}/image/${encodeURIComponent(fileName)}`);
      return true;
    } catch (error) {
      console.error('Image deletion failed:', error);
      return false;
    }
  },

  /**
   * Validate image count
   */
  validateImageCount: async (count: number): Promise<{ isValid: boolean; message: string }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/image/validate`, {
        params: { count },
      });

      return response.data;
    } catch (error) {
      console.error('Image count validation failed:', error);
      return {
        isValid: false,
        message: 'Failed to validate image count',
      };
    }
  },

  /**
   * Validate a single image file
   */
  validateImageFile: async (file: File): Promise<ImageValidationResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<ImageValidationResult>(
        `${API_BASE_URL}/image/validate-file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Image file validation failed:', error);
      return {
        isValid: false,
        fileSize: file.size,
        fileName: file.name,
        errorMessage: 'Failed to validate image file',
      };
    }
  },

  /**
   * Check if an image exists
   */
  checkImageExists: async (fileName: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/image/exists/${encodeURIComponent(fileName)}`);
      return response.data.exists;
    } catch (error) {
      console.error('Image existence check failed:', error);
      return false;
    }
  },
};
