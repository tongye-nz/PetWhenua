export const PostType = {
  Meetup: 0,
  PetWedding: 1,
  BuySell: 2,
  Library: 3,
  Announcement: 4,
  Moment: 5
} as const;

export type PostType = typeof PostType[keyof typeof PostType];

export const PostStatus = {
  Active: 0,
  Sold: 1,
  Expired: 2,
  Inactive: 3,
  Cancelled: 4,
  Pending: 5
} as const;

export type PostStatus = typeof PostStatus[keyof typeof PostStatus];

export interface Post {
  postId: number;
  userId: number;
  postType: PostType;
  title: string;
  content: string;
  images: string[];
  location?: string;
  address?: string;
  price?: number;
  eventDate?: string;
  category?: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    userId: number;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    location?: string;
    role: string;
  };
  petWeddingParticipants?: {
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
  }[];
}

export interface CreatePostRequest {
  userId?: number;
  postType: PostType;
  title: string;
  content: string;
  images?: string[];
  location?: string;
  address?: string;
  price?: number;
  eventDate?: string;
  category?: string;
  selectedPetIds?: number[];
  petWeddingParticipants?: {
    participantId: number;
    postId: number;
    petId: number;
    ownerId: number;
    hasApproved: boolean;
    approvedAt?: string;
    createdAt: string;
  }[];
}

export interface UpdatePostRequest {
  userId?: number;
  postType?: PostType;
  title?: string;
  content?: string;
  status?: PostStatus;
  images?: string[];
  location?: string;
  address?: string;
  price?: number;
  eventDate?: string;
  category?: string;
  selectedPetIds?: number[];
  createdAt?: string;
  updatedAt?: string;
  petWeddingParticipants?: {
    participantId: number;
    postId: number;
    petId: number;
    ownerId: number;
    hasApproved: boolean;
    approvedAt?: string;
    createdAt: string;
  }[];
}

export interface UpdatePostStatusRequest {
  status: PostStatus;
  userId: number;
  userRole: string;
}

export interface PostFilters {
  postType?: PostType;
  userId?: number;
  status?: PostStatus;
  region?: string;
  district?: string;
}

export interface PostPermissions {
  canCreate: { [key in PostType]: boolean };
  canEdit: boolean;
  canChangeStatus: boolean;
  availableTransitions: PostStatus[];
}
