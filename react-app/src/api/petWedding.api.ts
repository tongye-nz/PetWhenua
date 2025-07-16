import axios from 'axios';
import type { 
  CreatePetWeddingRequest,
  SelectablePet,
  PetWeddingPost
} from '../models/petWedding.types';
import type { Post } from '../models/post.types';

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

export const petWeddingService = {
  // Create a pet wedding
  async createPetWedding(request: CreatePetWeddingRequest): Promise<{ message: string; wedding: Post }> {
    const response = await api.post('/petwedding/create', request);
    return response.data;
  },

  // Approve pet wedding participation
  async approvePetWeddingParticipation(postId: number): Promise<{ message: string }> {
    const response = await api.post(`/petwedding/${postId}/approve`);
    return response.data;
  },

  // Get pending wedding approvals for current user
  async getPendingWeddingApprovals(): Promise<PetWeddingPost[]> {
    const response = await api.get<PetWeddingPost[]>('/petwedding/pending-approvals');
    return response.data;
  },

  // Get selectable pets for wedding
  async getSelectablePetsForWedding(): Promise<SelectablePet[]> {
    const response = await api.get<SelectablePet[]>('/petwedding/selectable-pets');
    return response.data;
  },

  // Check if user can select a specific pet for wedding
  async canSelectPetForWedding(petId: number): Promise<boolean> {
    const response = await api.get<{ canSelect: boolean }>(`/petwedding/can-select-pet/${petId}`);
    return response.data.canSelect;
  },

  // Update pet wedding participants
  async updatePetWeddingParticipants(postId: number, petIds: number[]): Promise<{ message: string; post: Post }> {
    const response = await api.put(`/petwedding/${postId}/participants`, { petIds });
    return response.data;
  },
};
