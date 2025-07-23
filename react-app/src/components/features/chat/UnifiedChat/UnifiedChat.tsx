import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Container,
  Paper,
  Box,
  Typography,
  IconButton,
  Avatar,
  TextField,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  Badge,
  Chip
} from '@mui/material';
import {
  Close,
  Send,
  Circle,
  Search,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useSignalR } from '../../../../contexts/SignalRContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { chatService } from '../../../../api/chat.api';
import type { ChatMessage, ChatRoom, MessageStatus } from '../../../../models/chat.types';
import type { User } from '../../../../models/auth.types';
import { getProfilePictureUrl } from '../../../../utils/imageUrlUtils';

export interface UnifiedChatProps {
  // Mode props
  mode: 'dialog' | 'page';
  
  // Dialog mode props
  open?: boolean;
  onClose?: () => void;
  initialUserId?: number;
  
  // Page mode props
  title?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chat-tabpanel-${index}`}
      aria-labelledby={`chat-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const UnifiedChat: React.FC<UnifiedChatProps> = ({ 
  mode,
  open = true,
  onClose,
  initialUserId,
  title = "Messages"
}) => {
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

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat rooms
  useEffect(() => {
    if ((mode === 'dialog' && open) || mode === 'page') {
      loadChatRooms();
      if (initialUserId) {
        handleStartChat(initialUserId);
      }
    }
  }, [mode, open, initialUserId]);

  // Load messages when room is selected
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.chatRoomId);
    }
  }, [selectedRoom]);

  // Set up SignalR message handler for page mode
  useEffect(() => {
    if (mode === 'page') {
      const handleMessage = (_message: ChatMessage) => {
        if (selectedRoom) {
          loadMessages(selectedRoom.chatRoomId);
        }
      };
      setChatMessageHandler(handleMessage);
    }
  }, [mode, selectedRoom, setChatMessageHandler]);

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
      // Mark messages as read
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
      setActiveTab(0); // Switch to messages tab
      
      // Update chat rooms list
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

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    // Check if message is from today
    if (messageDay.getTime() === today.getTime()) {
      // Today: show only time
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } 
    
    // Check if message is from yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDay.getTime() === yesterday.getTime()) {
      // Yesterday: show "Yesterday" + time
      const time = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `Yesterday ${time}`;
    }
    
    // Check if message is from this week (within last 7 days)
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    if (messageDay >= weekAgo) {
      // This week: show day name + time
      const dayName = messageDate.toLocaleDateString([], { weekday: 'short' });
      const time = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${dayName} ${time}`;
    }
    
    // Older messages: show date + time
    const dateStr = messageDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
    const time = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${time}`;
  };

  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 1: return '✓';
      case 2: return '✓✓';
      default: return '';
    }
  };

  const isTypingInRoom = (roomId: number) => {
    if (!selectedRoom || roomId !== selectedRoom.chatRoomId) return false;
    const partnerId = getChatPartner(selectedRoom).userId;
    return typingUsers.has(partnerId);
  };

  // Common chat content
  const chatContent = (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Messages" />
          <Tab label="New Chat" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', height: mode === 'dialog' ? '60vh' : '70vh' }}>
            {/* Chat Rooms List */}
            <Box sx={{ width: mode === 'dialog' ? 300 : '33%', borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
              <List sx={{ p: 0 }}>
                {chatRooms.map((room) => {
                  const partner = getChatPartner(room);
                  const isSelected = selectedRoom?.chatRoomId === room.chatRoomId;
                  
                  return (
                    <ListItemButton
                      key={room.chatRoomId}
                      selected={isSelected}
                      onClick={() => setSelectedRoom(room)}
                      sx={{ py: 2 }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            isUserOnline(partner.userId) ? (
                              <Circle sx={{ color: 'success.main', fontSize: 12 }} />
                            ) : null
                          }
                        >
                          <Avatar src={getProfilePictureUrl(partner.profilePicture)}>
                            {partner.firstName?.charAt(0)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${partner.firstName} ${partner.lastName}`}
                        secondary={room.lastMessage}
                        secondaryTypographyProps={{
                          noWrap: true,
                          sx: { maxWidth: mode === 'dialog' ? 150 : 200 }
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {selectedRoom ? (
                <>
                  {/* Chat Header */}
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          isUserOnline(getChatPartner(selectedRoom).userId) ? (
                            <Circle sx={{ color: 'success.main', fontSize: 12 }} />
                          ) : null
                        }
                      >
                        <Avatar src={getProfilePictureUrl(getChatPartner(selectedRoom).profilePicture)}>
                          {getChatPartner(selectedRoom).firstName?.charAt(0)}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {getChatPartner(selectedRoom).firstName} {getChatPartner(selectedRoom).lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {isUserOnline(getChatPartner(selectedRoom).userId) ? 'Online' : 'Offline'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Messages List */}
                  <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                    {messages.map((message) => {
                      const isOwnMessage = message.senderId === getCurrentUserId();
                      
                      return (
                        <Box
                          key={message.messageId}
                          sx={{
                            display: 'flex',
                            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                            mb: 1
                          }}
                        >
                          <Paper
                            sx={{
                              p: 1.5,
                              maxWidth: '70%',
                              bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
                              color: isOwnMessage ? 'white' : 'text.primary'
                            }}
                          >
                            <Typography variant="body2">{message.content}</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {formatMessageTime(message.sentAt)}
                              </Typography>
                              {isOwnMessage && (
                                <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                                  {getMessageStatusIcon(message.status)}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        </Box>
                      );
                    })}
                    
                    {/* Typing Indicator */}
                    {selectedRoom && isTypingInRoom(selectedRoom.chatRoomId) && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                        <Chip label="Typing..." size="small" sx={{ opacity: 0.7 }} />
                      </Box>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Message Input */}
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                          handleTyping();
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        multiline
                        maxRows={3}
                        size="small"
                      />
                      <IconButton 
                        color="primary" 
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                      >
                        <Send />
                      </IconButton>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'text.secondary'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ChatIcon sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6">Select a conversation</Typography>
                    <Typography>Choose a chat to start messaging</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 2, maxWidth: mode === 'dialog' ? '100%' : 600, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search users to chat with..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsersForChat(e.target.value);
              }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ mb: 2 }}
            />
            
            <List>
              {searchUsers.map((user) => (
                <ListItemButton
                  key={user.userId}
                  onClick={() => handleStartChat(user.userId)}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        isUserOnline(user.userId) ? (
                          <Circle sx={{ color: 'success.main', fontSize: 12 }} />
                        ) : null
                      }
                    >
                      <Avatar src={getProfilePictureUrl(user.profilePicture)}></Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                    secondary={user.location}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </TabPanel>
      </Box>
    </>
  );

  // Render based on mode
  if (mode === 'dialog') {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon color="primary" />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
          {chatContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Page mode
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      
      <Paper sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
        {chatContent}
      </Paper>
    </Container>
  );
}; 