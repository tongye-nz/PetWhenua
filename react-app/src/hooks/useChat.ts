import { useState, useEffect, useRef } from 'react';
import { useSignalR } from '../contexts/SignalRContext';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../api/chat.api';
import type { ChatMessage, ChatRoom } from '../models/chat.types';
import type { User } from '../models/auth.types';

export const useChat = (initialUserId?: number, shouldAutoLoad: boolean = true) => {
  const { onlineUsers, typingUsers, setChatMessageHandler } = useSignalR();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Load data on mount
  useEffect(() => {
    if (shouldAutoLoad) {
      loadChatRooms();
      if (initialUserId) {
        handleStartChat(initialUserId);
      }
    }
  }, [shouldAutoLoad, initialUserId]);

  // Set up message handler
  useEffect(() => {
    const handleMessage = (_message: ChatMessage) => {
      if (selectedRoom) {
        loadMessages(selectedRoom.chatRoomId);
      }
    };
    setChatMessageHandler(handleMessage);
  }, [selectedRoom, setChatMessageHandler]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatRooms = async () => {
    try {
      const rooms = await chatService.getChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    }
  };

  const loadMessages = async (chatRoomId: number) => {
    try {
      const roomMessages = await chatService.getMessages(chatRoomId);
      setMessages(roomMessages);
      await chatService.markMessagesAsRead(chatRoomId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const searchUsersForChat = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchUsers([]);
      return;
    }
    
    try {
      const users = await chatService.searchUsers(query);
      setSearchUsers(users);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleStartChat = async (userId: number) => {
    try {
      const room = await chatService.getOrCreateChatRoom(userId);
      setSelectedRoom(room);
      setActiveTab(0);
      
      const existingRoom = chatRooms.find(r => r.chatRoomId === room.chatRoomId);
      if (!existingRoom) {
        setChatRooms(prev => [room, ...prev]);
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedRoom) return;

    try {
      const receiverId = selectedRoom.user1Id === getCurrentUserId() ? selectedRoom.user2Id : selectedRoom.user1Id;
      const message = await chatService.sendMessage({
        receiverId,
        content: messageInput.trim(),
        chatRoomId: selectedRoom.chatRoomId
      });

      setMessages(prev => [...prev, message]);
      setMessageInput('');
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const getCurrentUserId = () => {
    return user?.userId || 0;
  };

  const isUserOnline = (userId: number) => {
    return onlineUsers.has(userId);
  };

  const getChatPartner = (room: ChatRoom) => {
    const currentUserId = getCurrentUserId();
    return room.user1Id === currentUserId ? room.user2 : room.user1;
  };

  return {
    // State
    activeTab,
    chatRooms,
    selectedRoom,
    messages,
    messageInput,
    searchUsers,
    searchQuery,
    isTyping,
    messagesEndRef,
    onlineUsers,
    typingUsers,
    
    // Actions
    setActiveTab,
    setSelectedRoom,
    setMessageInput,
    setSearchQuery,
    loadChatRooms,
    loadMessages,
    searchUsersForChat,
    handleStartChat,
    handleSendMessage,
    handleTyping,
    
    // Utilities
    getCurrentUserId,
    isUserOnline,
    getChatPartner
  };
}; 