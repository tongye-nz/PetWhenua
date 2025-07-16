export interface PetWeddingParticipant {
  participantId: number;
  postId: number;
  petId: number;
  ownerId: number;
  hasApproved: boolean;
  approvedAt?: string;
  createdAt: string;
  pet?: Pet;
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

import type { Pet } from './pet.types';
import type { User } from './auth.types';
import type { Post } from './post.types';
