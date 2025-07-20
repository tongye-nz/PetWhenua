import axios from 'axios';
import type { 
  PetConnection, 
  RequestConnectionRequest, 
  RespondConnectionRequest,
  ConnectionStatusResponse
} from '../models/petConnection.types';
import type { Pet } from '../models/pet.types';
import { API_CONFIG } from './config';

const API_BASE_URL = API_CONFIG.BASE_URL;

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

export const petConnectionService = {
  // Request a pet connection
  async requestConnection(request: RequestConnectionRequest): Promise<{ message: string; connection: PetConnection }> {
    const response = await api.post('/petconnection/request', request);
    return response.data;
  },

  // Respond to a connection request
  async respondToConnection(connectionId: number, request: RespondConnectionRequest): Promise<{ message: string; connection: PetConnection }> {
    const response = await api.post(`/petconnection/${connectionId}/respond`, request);
    return response.data;
  },

  // Get pending connections for current user
  async getPendingConnections(): Promise<PetConnection[]> {
    const response = await api.get<PetConnection[]>('/petconnection/pending');
    return response.data;
  },

  // Get connected pets for a specific pet
  async getConnectedPets(petId: number): Promise<Pet[]> {
    const response = await api.get<Pet[]>(`/petconnection/connected/${petId}`);
    return response.data;
  },

  // Get available pets for connection
  async getAvailablePetsForConnection(petId: number): Promise<Pet[]> {
    const response = await api.get<Pet[]>(`/petconnection/available/${petId}`);
    return response.data;
  },

  // Get connection status between two pets
  async getConnectionStatus(pet1Id: number, pet2Id: number): Promise<ConnectionStatusResponse> {
    const response = await api.get<ConnectionStatusResponse>(`/petconnection/status/${pet1Id}/${pet2Id}`);
    return response.data;
  }
};
