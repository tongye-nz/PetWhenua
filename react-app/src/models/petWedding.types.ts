export interface PetWeddingParticipant {
  participantId: number;
  postId: number;
  petId: number;
  ownerId: number;
  hasApproved: boolean;
  approvedAt?: string;
  createdAt: string;
  pet?: {
    petId: number;
    userId: number;
    name: string;
    species?: string;
    breed?: string;
    age: number;
    birthYear?: number;
    birthMonth?: number;
    gender?: string;
    description?: string;
    profilePicture?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  owner?: User;
}

export interface CreatePetWeddingRequest {
  title: string;
  content: string;
  petIds: number[];
  location: string;
  address: string;
  eventDate: string;
  images?: string[];
  category?: string;
}

export interface PetWeddingPost extends Post {
  address?: string;
  petWeddingParticipants?: PetWeddingParticipant[];
}

export interface SelectablePet extends Pet {
  isOwned: boolean;
  isConnected: boolean;
  connectionOwner?: User;
}

import type { User } from './auth.types';
import type { Post } from './post.types';
import type { Pet } from './pet.types';
