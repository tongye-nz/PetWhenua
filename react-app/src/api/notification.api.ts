import axios from 'axios';
import type { 
  Notification, 
  CreateNotificationRequest, 
  NotificationCount 
} from '../models/notification.types';

const API_BASE_URL = 'http://localhost:5295/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationService = {
  // Get user notifications with pagination
  async getNotifications(page: number = 1, pageSize: number = 20): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/notification', {
      params: { page, pageSize }
    });
    return response.data;
  },

  // Get unread notifications
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/notification/unread');
    return response.data;
  },

  // Get notification count
  async getNotificationCount(): Promise<NotificationCount> {
    const response = await api.get<NotificationCount>('/notification/count');
    return response.data;
  },

  // Get specific notification
  async getNotification(notificationId: number): Promise<Notification> {
    const response = await api.get<Notification>(`/notification/${notificationId}`);
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/notification/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>('/notification/read-all');
    return response.data;
  },

  // Dismiss notification
  async dismissNotification(notificationId: number): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/notification/${notificationId}/dismiss`);
    return response.data;
  },

  // Delete notification
  async deleteNotification(notificationId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/notification/${notificationId}`);
    return response.data;
  },

  // Create notification (mainly for testing or admin use)
  async createNotification(request: CreateNotificationRequest): Promise<Notification> {
    const response = await api.post<Notification>('/notification', request);
    return response.data;
  }
}; 