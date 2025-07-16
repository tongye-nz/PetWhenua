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
}

export interface CreatePostRequest {
  userId: number;
  userRole: string;
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
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  images?: string[];
  location?: string;
  address?: string;
  price?: number;
  eventDate?: string;
  category?: string;
  selectedPetIds?: number[];
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
