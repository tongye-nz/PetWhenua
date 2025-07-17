import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { signalRService } from '../services/signalRService';
import { useAuth } from './AuthContext';
import { notificationService } from '../api/notification.api';
import type { Notification } from '../models/notification.types';
import type { ChatMessage, TypingIndicator } from '../models/chat.types';

interface SignalRContextType {
  // Connection state
  isConnected: boolean;
  connectionState: string;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  removeNotification: (notificationId: number) => void;
  markNotificationAsRead: (notificationId: number) => void;
  clearAllNotifications: () => void;
  
  // Chat
  chatMessages: ChatMessage[];
  typingUsers: Map<number, TypingIndicator>;
  onlineUsers: Set<number>;
  sendChatMessage: (receiverId: number, message: ChatMessage) => Promise<void>;
  joinChatRoom: (chatRoomId: number, otherUserId: number) => Promise<void>;
  leaveChatRoom: (chatRoomId: number, otherUserId: number) => Promise<void>;
  sendTypingIndicator: (chatRoomId: number, receiverId: number, isTyping: boolean) => Promise<void>;
  markMessagesAsRead: (chatRoomId: number, senderId: number, messageIds: number[]) => Promise<void>;
  
  // Event handlers for custom components
  onNotificationReceived?: (notification: Notification) => void;
  onChatMessageReceived?: (message: ChatMessage) => void;
  setNotificationHandler: (handler: (notification: Notification) => void) => void;
  setChatMessageHandler: (handler: (message: ChatMessage) => void) => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<number, TypingIndicator>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  
  // Custom event handlers
  const [notificationHandler, setNotificationHandler] = useState<((notification: Notification) => void) | undefined>();
  const [chatMessageHandler, setChatMessageHandler] = useState<((message: ChatMessage) => void) | undefined>();

  // Initialize SignalR connection when user is authenticated
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('authToken');
      if (token) {
        connectToHub(token);
      }
    } else {
      disconnectFromHub();
    }

    return () => {
      disconnectFromHub();
    };
  }, [user]);

  const connectToHub = useCallback(async (token: string) => {
    try {
      console.log('Starting SignalR connection...');
      
      // Set up event handlers first
      signalRService.onConnectionStatus((connected) => {
        console.log('SignalR connection status changed:', connected);
        setIsConnected(connected);
      });
      
      signalRService.onNotification((notification) => {
        console.log('Received notification in context:', notification);
        addNotification(notification);
        notificationHandler?.(notification);
      });

      signalRService.onChatMessage((message) => {
        console.log('Received chat message in context:', message);
        setChatMessages(prev => [...prev, message]);
        chatMessageHandler?.(message);
      });

      signalRService.onChatMessageConfirmation((message) => {
        console.log('Chat message sent confirmation:', message);
        // Update message status or handle confirmation
      });

      signalRService.onTyping((indicator) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (indicator.isTyping) {
            newMap.set(indicator.userId, indicator);
          } else {
            newMap.delete(indicator.userId);
          }
          return newMap;
        });

        // Auto-clear typing indicator after 5 seconds
        if (indicator.isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => {
              const newMap = new Map(prev);
              newMap.delete(indicator.userId);
              return newMap;
            });
          }, 5000);
        }
      });

      signalRService.onUserStatus((data) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (data.isOnline) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      });

      signalRService.onMessageRead((data) => {
        // Update message read status
        setChatMessages(prev =>
          prev.map(msg =>
            data.messageIds.includes(msg.messageId)
              ? { ...msg, status: 2, readAt: data.readAt } // 2 = Read
              : msg
          )
        );
      });

      // Connect to SignalR hub
      console.log('Attempting to connect to SignalR hub with token...');
      await signalRService.connect(token);
      setConnectionState(signalRService.connectionState);
      console.log('SignalR connection successful, state:', signalRService.connectionState);
      
      // Load initial notifications and unread count (in background, don't block connection)
      setTimeout(async () => {
        try {
          console.log('Loading initial notifications...');
          const [unreadNotifications, notificationCount] = await Promise.all([
            notificationService.getUnreadNotifications(),
            notificationService.getNotificationCount()
          ]);
          
          setNotifications(unreadNotifications);
          setUnreadCount(notificationCount.unreadCount);
          console.log('Loaded initial notifications:', unreadNotifications.length, 'unread count:', notificationCount.unreadCount);
        } catch (error) {
          console.error('Failed to load initial notifications:', error);
          // Don't fail the entire connection if notifications can't be loaded
        }
      }, 1000); // Delay to ensure connection is stable
      
    } catch (error) {
      console.error('Failed to connect to SignalR:', error);
      setIsConnected(false);
      setConnectionState('Failed');
      // Don't throw error, let the automatic reconnection handle it
    }
  }, [notificationHandler, chatMessageHandler]);

  const disconnectFromHub = useCallback(async () => {
    try {
      await signalRService.disconnect();
      setIsConnected(false);
      setConnectionState('Disconnected');
      setNotifications([]);
      setUnreadCount(0);
      setChatMessages([]);
      setTypingUsers(new Map());
      setOnlineUsers(new Set());
    } catch (error) {
      console.error('Failed to disconnect from SignalR:', error);
    }
  }, []);

  // Notification management
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (notification.status === 0) { // Unread
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const removeNotification = useCallback((notificationId: number) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.notificationId === notificationId);
      if (notification && notification.status === 0) { // Was unread
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.notificationId !== notificationId);
    });
  }, []);

  const markNotificationAsRead = useCallback((notificationId: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.notificationId === notificationId
          ? { ...notification, status: 1, readAt: new Date().toISOString() } // 1 = Read
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Chat methods
  const sendChatMessage = useCallback(async (receiverId: number, message: ChatMessage) => {
    try {
      await signalRService.sendChatMessage(receiverId, message);
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }
  }, []);

  const joinChatRoom = useCallback(async (chatRoomId: number, otherUserId: number) => {
    try {
      await signalRService.joinChatRoom(chatRoomId, otherUserId);
    } catch (error) {
      console.error('Failed to join chat room:', error);
      throw error;
    }
  }, []);

  const leaveChatRoom = useCallback(async (chatRoomId: number, otherUserId: number) => {
    try {
      await signalRService.leaveChatRoom(chatRoomId, otherUserId);
    } catch (error) {
      console.error('Failed to leave chat room:', error);
      throw error;
    }
  }, []);

  const sendTypingIndicator = useCallback(async (chatRoomId: number, receiverId: number, isTyping: boolean) => {
    try {
      await signalRService.sendTypingIndicator(chatRoomId, receiverId, isTyping);
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }, []);

  const markMessagesAsRead = useCallback(async (chatRoomId: number, senderId: number, messageIds: number[]) => {
    try {
      await signalRService.markMessagesAsRead(chatRoomId, senderId, messageIds);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  }, []);

  const setNotificationHandlerWrapper = useCallback((handler: (notification: Notification) => void) => {
    setNotificationHandler(() => handler);
  }, []);

  const setChatMessageHandlerWrapper = useCallback((handler: (message: ChatMessage) => void) => {
    setChatMessageHandler(() => handler);
  }, []);

  const value: SignalRContextType = {
    isConnected,
    connectionState,
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearAllNotifications,
    chatMessages,
    typingUsers,
    onlineUsers,
    sendChatMessage,
    joinChatRoom,
    leaveChatRoom,
    sendTypingIndicator,
    markMessagesAsRead,
    onNotificationReceived: notificationHandler,
    onChatMessageReceived: chatMessageHandler,
    setNotificationHandler: setNotificationHandlerWrapper,
    setChatMessageHandler: setChatMessageHandlerWrapper,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = (): SignalRContextType => {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
}; 