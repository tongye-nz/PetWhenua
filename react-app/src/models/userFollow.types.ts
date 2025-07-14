export interface UserFollow {
  userFollowId: number;
  followerId: number;
  followingId: number;
  createdAt: string;
  follower?: User;
  following?: User;
}

export interface FollowStats {
  followerCount: number;
  followingCount: number;
}

export interface FollowRequest {
  userId: number;
}

export interface FollowResponse {
  message: string;
  follow?: UserFollow;
}

export interface IsFollowingResponse {
  isFollowing: boolean;
}

import type { User } from './auth.types';
