import axios from 'axios';
import type { 
  ChatMessage, 
  ChatRoom, 
  SendMessageRequest 
} from '../models/chat.types';
import { API_CONFIG } from './config';

// Create axios instance with base configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

const chatApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatService = {
  // Get all chat rooms for current user
  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      const response = await chatApi.get('/chat/rooms');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  // Get or create a chat room with another user
  async getOrCreateChatRoom(otherUserId: number): Promise<ChatRoom> {
    try {
      const response = await chatApi.post('/chat/rooms', { OtherUserId: otherUserId });
      return response.data;
    } catch (error) {
      console.error('Error creating/getting chat room:', error);
      throw error;
    }
  },

  // Get messages for a specific chat room
  async getMessages(chatRoomId: number, page = 1, limit = 50): Promise<ChatMessage[]> {
    try {
      const response = await chatApi.get(`/chat/rooms/${chatRoomId}/messages`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a new message
  async sendMessage(messageData: SendMessageRequest): Promise<ChatMessage> {
    try {
      const response = await chatApi.post('/chat/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  async markMessagesAsRead(chatRoomId: number): Promise<void> {
    try {
      await chatApi.put(`/chat/rooms/${chatRoomId}/mark-read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Mark a specific message as delivered
  async markMessageAsDelivered(messageId: number): Promise<void> {
    try {
      await chatApi.put(`/chat/messages/${messageId}/delivered`);
    } catch (error) {
      console.error('Error marking message as delivered:', error);
      throw error;
    }
  },

  // Get unread message count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await chatApi.get('/chat/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Delete a message
  async deleteMessage(messageId: number): Promise<void> {
    try {
      await chatApi.delete(`/chat/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Search for users to start new chats
  async searchUsers(query: string): Promise<any[]> {
    try {
      const response = await chatApi.get('/users/search', {
        params: { q: query, limit: 10 }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
}; 