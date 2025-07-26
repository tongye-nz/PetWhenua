import axios, { AxiosError } from 'axios';
import type { Pet, CreatePetRequest, UpdatePetRequest, PetFilters } from '../models/pet.types';
import { API_CONFIG } from '../config/api.config';

// Create axios instance for pet API
const petApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
petApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
petApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(API_CONFIG.TOKEN_KEY);
      localStorage.removeItem(API_CONFIG.USER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handlePetApiError = (error: AxiosError): Error => {
  if (error.response?.data) {
    const data = error.response.data as any;
    
    if (typeof data === 'string') {
      return new Error(data);
    }
    
    if (data.message) {
      return new Error(data.message);
    }
  }
  
  return new Error(error.message || 'An unexpected error occurred');
};

// Pet API functions
export const petService = {
  // Get all pets with optional filters
  async getPets(filters?: PetFilters): Promise<Pet[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.includeUser) {
        params.append('includeUser', 'true');
      }
      if (filters?.userId) {
        params.append('userId', filters.userId.toString());
      }
      
      const response = await petApi.get<Pet[]>(`${API_CONFIG.ENDPOINTS.PETS}?${params}`);
      return response.data;
    } catch (error) {
      throw handlePetApiError(error as AxiosError);
    }
  },

  // Get pet by ID
  async getPetById(petId: number, includeUser: boolean = false): Promise<Pet> {
    try {
      const params = includeUser ? '?includeUser=true' : '';
      const response = await petApi.get<Pet>(`${API_CONFIG.ENDPOINTS.PETS}/${petId}${params}`);
      return response.data;
    } catch (error) {
      throw handlePetApiError(error as AxiosError);
    }
  },

  // Get user's pets
  async getUserPets(userId: number, includeUser: boolean = false): Promise<Pet[]> {
    try {
      const params = new URLSearchParams();
      params.append('userId', userId.toString());
      if (includeUser) {
        params.append('includeUser', 'true');
      }
      
      const response = await petApi.get<Pet[]>(`${API_CONFIG.ENDPOINTS.PETS}?${params}`);
      return response.data;
    } catch (error) {
      throw handlePetApiError(error as AxiosError);
    }
  },

  // Get current user's pets
  async getCurrentUserPets(userId: number, includeUser: boolean = false): Promise<Pet[]> {
    try {
      const params = includeUser ? '?includeUser=true' : '';
      const response = await petApi.get<Pet[]>(`${API_CONFIG.ENDPOINTS.PETS}/user/${userId}${params}`);
      return response.data;
    } catch (error) {
      throw handlePetApiError(error as AxiosError);
    }
  },

  // Create new pet
  async createPet(petData: CreatePetRequest): Promise<Pet> {
    try {
      const response = await petApi.post<Pet>(API_CONFIG.ENDPOINTS.PETS, petData);
      return response.data;
    } catch (error) {
      throw handlePetApiError(error as AxiosError);
    }
  },

  // Update pet
  async updatePet(petId: number, petData: UpdatePetRequest): Promise<Pet> {
    try {
      const response = await petApi.put<Pet>(`${API_CONFIG.ENDPOINTS.PETS}/${petId}`, petData);
      return response.data;
    } catch (error) {
      throw handlePetApiError(error as AxiosError);
    }
  },

  // Delete pet
  async deletePet(petId: number): Promise<void> {
    try {
      await petApi.delete(`${API_CONFIG.ENDPOINTS.PETS}/${petId}`);
    } catch (error) {
      throw handlePetApiError(error as AxiosError);
    }
  },

  // Upload pet profile picture
  async uploadPetPicture(petId: number, file: File): Promise<{ profilePicture: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await petApi.post<{ profilePicture: string }>(
        `${API_CONFIG.ENDPOINTS.PETS}/${petId}/upload-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      throw handlePetApiError(error as AxiosError);
    }
  }
};
