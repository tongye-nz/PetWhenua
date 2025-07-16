export const PetConnectionStatus = {
  Pending: 'Pending',
  Accepted: 'Accepted',
  Rejected: 'Rejected',
  Blocked: 'Blocked'
} as const;

export type PetConnectionStatus = typeof PetConnectionStatus[keyof typeof PetConnectionStatus];

export interface PetConnection {
  petConnectionId: number;
  pet1Id: number;
  pet2Id: number;
  status: PetConnectionStatus;
  requestedById: number;
  requestedAt: string;
  respondedAt?: string;
  requestMessage?: string;
  responseMessage?: string;
  pet1?: Pet;
  pet2?: Pet;
  requestedBy?: User;
}

export interface RequestConnectionRequest {
  pet1Id: number;
  pet2Id: number;
  message?: string;
}

export interface RespondConnectionRequest {
  response: PetConnectionStatus;
  message?: string;
}

export interface ConnectionStatusResponse {
  areConnected: boolean;
  connection?: PetConnection;
  status: string;
}

import type { Pet } from './pet.types';
import type { User } from './auth.types';
