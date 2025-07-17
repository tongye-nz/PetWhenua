export const NotificationType = {
  PetConnectionRequest: 0,
  PetConnectionApproved: 1,
  PetConnectionRejected: 2,
  PetWeddingPendingApproval: 3,
  PetWeddingApproved: 4,
  PetWeddingRejected: 5,
  MeetupPendingActivation: 6,
  MeetupActivated: 7,
  PostLiked: 8,
  PostCommented: 9,
  UserFollowed: 10,
  ChatMessage: 11,
  General: 12
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationStatus = {
  Unread: 0,
  Read: 1,
  Dismissed: 2
} as const;

export type NotificationStatus = typeof NotificationStatus[keyof typeof NotificationStatus];

export interface Notification {
  notificationId: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  relatedPostId?: number;
  relatedPetId?: number;
  relatedUserId?: number;
  relatedConnectionId?: number;
  additionalData?: string;
  createdAt: string;
  readAt?: string;
  relatedUserName?: string;
  relatedPetName?: string;
  relatedPostTitle?: string;
}

export interface CreateNotificationRequest {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedPostId?: number;
  relatedPetId?: number;
  relatedUserId?: number;
  relatedConnectionId?: number;
  additionalData?: string;
}

export interface UpdateNotificationStatusRequest {
  status: NotificationStatus;
}

export interface NotificationCount {
  unreadCount: number;
  totalCount: number;
}

export interface RealTimeNotification {
  notification: Notification;
  connectionId: string;
  timestamp: string;
} 