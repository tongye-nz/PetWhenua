export const MessageStatus = {
  Sent: 0,
  Delivered: 1,
  Read: 2
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];

export interface ChatMessage {
  messageId: number;
  senderId: number;
  receiverId: number;
  content: string;
  status: MessageStatus;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  relatedPostId?: number;
  relatedPetId?: number;
  senderName: string;
  senderProfilePicture?: string;
  relatedPostTitle?: string;
  relatedPetName?: string;
}

export interface SendMessageRequest {
  receiverId: number;
  content: string;
  relatedPostId?: number;
  relatedPetId?: number;
  chatRoomId?: number;
}

export interface ChatRoom {
  chatRoomId: number;
  user1Id: number;
  user2Id: number;
  user1: {
    userId: number;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    location?: string;
  };
  user2: {
    userId: number;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    location?: string;
  };
  createdAt: string;
  lastMessageAt: string;
  lastMessage?: string;
  lastMessageSenderId?: number;
}

export interface UpdateMessageStatusRequest {
  status: MessageStatus;
}

export interface RealTimeChatMessage {
  message: ChatMessage;
  chatRoomId: string;
  timestamp: string;
}

export interface TypingIndicator {
  userId: number;
  userName: string;
  chatRoomId: number;
  isTyping: boolean;
  timestamp: string;
}

export interface ChatParticipant {
  userId: number;
  userName: string;
  profilePicture?: string;
  isOnline: boolean;
  lastSeen?: string;
} 