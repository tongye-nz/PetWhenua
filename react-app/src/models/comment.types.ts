export interface CommentUser {
  userId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface Comment {
  commentId: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
}

export interface CreateCommentRequest {
  postId: number;
  userId: number;
  content: string;
}

export interface UpdateCommentRequest {
  userId: number;
  content: string;
}

export interface CommentResponse {
  commentId: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
} 