import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { Notification } from '../models/notification.types';
import type { ChatMessage, TypingIndicator } from '../models/chat.types';
import { API_CONFIG } from '../config/api.config';

export class SignalRService {
  private connection: HubConnection | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;

  // Event handlers
  private onNotificationReceived?: (notification: Notification) => void;
  private onChatMessageReceived?: (message: ChatMessage) => void;
  private onChatMessageSent?: (message: ChatMessage) => void;
  private onTypingIndicator?: (indicator: TypingIndicator) => void;
  private onUserOnlineStatus?: (data: { userId: number; isOnline: boolean }) => void;
  private onConnectionStateChanged?: (isConnected: boolean) => void;
  private onMessagesMarkedAsRead?: (data: { chatRoomId: number; messageIds: number[]; readBy: number; readAt: string }) => void;

  async connect(token: string): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      // Extract base URL from API config and create SignalR hub URL
      const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
      const hubUrl = `${baseUrl}/hubs/notifications`;

      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          withCredentials: true,
          skipNegotiation: false,
          transport: undefined // Let SignalR choose the best transport
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Match server's configuration with exponential backoff
            if (retryContext.previousRetryCount < 3) {
              return 1000 * Math.pow(2, retryContext.previousRetryCount);
            }
            return 30000; // Max 30 seconds
          }
        })
        .configureLogging(LogLevel.Information)
        // Configure timeout settings to match backend
        .withServerTimeout(70000) // 70 seconds (longer than server's 60 seconds)
        .withKeepAliveInterval(25000) // 25 seconds (shorter than server's 30 seconds)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      await this.connection.start();
      console.log('SignalR connection established to:', hubUrl);
      
      this.reconnectAttempts = 0;
      this.onConnectionStateChanged?.(true);
    } catch (error) {
      console.error('Failed to connect to SignalR hub:', error);
      this.handleReconnect(token);
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.onConnectionStateChanged?.(false);
      console.log('SignalR connection closed');
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Notification events
    this.connection.on('ReceiveNotification', (notification: Notification) => {
      console.log('Received notification:', notification);
      this.onNotificationReceived?.(notification);
    });

    // Chat events
    this.connection.on('ReceiveChatMessage', (message: ChatMessage) => {
      console.log('Received chat message:', message);
      this.onChatMessageReceived?.(message);
    });

    this.connection.on('ChatMessageSent', (message: ChatMessage) => {
      console.log('Chat message sent confirmation:', message);
      this.onChatMessageSent?.(message);
    });

    this.connection.on('TypingIndicator', (indicator: TypingIndicator) => {
      this.onTypingIndicator?.(indicator);
    });

    this.connection.on('MessagesMarkedAsRead', (data: { chatRoomId: number; messageIds: number[]; readBy: number; readAt: string }) => {
      this.onMessagesMarkedAsRead?.(data);
    });

    // User status events
    this.connection.on('UserOnlineStatus', (data: { userId: number; isOnline: boolean }) => {
      this.onUserOnlineStatus?.(data);
    });

    this.connection.on('UserJoinedChat', (data: { userId: number; chatRoomId: number }) => {
      console.log('User joined chat:', data);
    });

    this.connection.on('UserLeftChat', (data: { userId: number; chatRoomId: number }) => {
      console.log('User left chat:', data);
    });

    // Handle online users responses
    this.connection.on('OnlineUsersResponse', (onlineUserIds: number[]) => {
      onlineUserIds.forEach(userId => {
        this.onUserOnlineStatus?.({ userId, isOnline: true });
      });
    });

    // Connection state events
    this.connection.onreconnecting((error) => {
      console.log('SignalR reconnecting...', error);
      this.onConnectionStateChanged?.(false);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
      this.reconnectAttempts = 0;
      this.onConnectionStateChanged?.(true);
    });

    this.connection.onclose((error) => {
      console.log('SignalR connection closed:', error);
      this.onConnectionStateChanged?.(false);
      
      // Handle timeout errors specifically
      if (error && error.message?.includes('timeout')) {
        console.log('Connection lost due to timeout, attempting to reconnect...');
        // Don't attempt immediate reconnection on timeout
        // Let the automatic reconnection handle it
      }
    });
  }

  private async handleReconnect(token: string): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.onConnectionStateChanged?.(false);
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect(token);
    }, this.reconnectDelay);
  }

  // Event handler setters
  onNotification(handler: (notification: Notification) => void): void {
    this.onNotificationReceived = handler;
  }

  onChatMessage(handler: (message: ChatMessage) => void): void {
    this.onChatMessageReceived = handler;
  }

  onChatMessageConfirmation(handler: (message: ChatMessage) => void): void {
    this.onChatMessageSent = handler;
  }

  onTyping(handler: (indicator: TypingIndicator) => void): void {
    this.onTypingIndicator = handler;
  }

  onUserStatus(handler: (data: { userId: number; isOnline: boolean }) => void): void {
    this.onUserOnlineStatus = handler;
  }

  onConnectionStatus(handler: (isConnected: boolean) => void): void {
    this.onConnectionStateChanged = handler;
  }

  onMessageRead(handler: (data: { chatRoomId: number; messageIds: number[]; readBy: number; readAt: string }) => void): void {
    this.onMessagesMarkedAsRead = handler;
  }

  // Hub method calls
  async sendChatMessage(receiverId: number, message: ChatMessage): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      try {
        await this.connection.invoke('SendChatMessage', receiverId, message);
      } catch (error) {
        console.error('Failed to send chat message:', error);
        throw error;
      }
    } else {
      throw new Error('SignalR connection not established');
    }
  }

  async joinChatRoom(chatRoomId: number, otherUserId: number): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      try {
        await this.connection.invoke('JoinChatRoom', chatRoomId, otherUserId);
      } catch (error) {
        console.error('Failed to join chat room:', error);
        throw error;
      }
    }
  }

  async leaveChatRoom(chatRoomId: number, otherUserId: number): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      try {
        await this.connection.invoke('LeaveChatRoom', chatRoomId, otherUserId);
      } catch (error) {
        console.error('Failed to leave chat room:', error);
        throw error;
      }
    }
  }

  async sendTypingIndicator(chatRoomId: number, receiverId: number, isTyping: boolean): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      try {
        await this.connection.invoke('SendTypingIndicator', chatRoomId, receiverId, isTyping);
      } catch (error) {
        console.error('Failed to send typing indicator:', error);
      }
    }
  }

  async markMessagesAsRead(chatRoomId: number, senderId: number, messageIds: number[]): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      try {
        await this.connection.invoke('MarkMessagesAsRead', chatRoomId, senderId, messageIds);
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
        throw error;
      }
    }
  }

  async requestOnlineUsers(userIds: number[]): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      try {
        await this.connection.invoke('RequestOnlineUsers', userIds);
      } catch (error) {
        console.error('Failed to request online users:', error);
        throw error;
      }
    }
  }

  // Connection state getters
  get isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }

  get connectionState(): string {
    return this.connection?.state || 'Disconnected';
  }
}

// Singleton instance
export const signalRService = new SignalRService(); 