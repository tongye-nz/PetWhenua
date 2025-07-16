export interface Like {
  likeId: number;
  postId: number;
  userId: number;
  createdAt: string;
}

export interface LikeRequest {
  postId: number;
  userId: number;
}

export interface LikeStatus {
  postId: number;
  userId: number;
  isLiked: boolean;
  likeCount: number;
}

export interface LikeResponse {
  likeId?: number;
  postId: number;
  userId: number;
  likeCount: number;
  isLiked: boolean;
}

export interface LikeCountResponse {
  postId: number;
  count: number;
}

export interface UserWhoLiked {
  userId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  createdAt: string;
} 