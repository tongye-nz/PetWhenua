import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Paper,
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
  Badge
} from '@mui/material';
import {
  Send,
  Search,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useSignalR } from '../contexts/SignalRContext';
import { chatService } from '../api/chat.api';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage, ChatRoom } from '../models/chat.types';
import type { User } from '../models/auth.types';
import { getProfilePictureUrl } from '../utils/imageUrlUtils';

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
      id={`messages-tabpanel-${index}`}
      aria-labelledby={`messages-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { onlineUsers, typingUsers, setChatMessageHandler } = useSignalR();
  const [currentTab, setCurrentTab] = useState(0);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    // Set up chat message handler
    const handleMessage = (_message: ChatMessage) => {
      if (selectedRoom) {
        loadMessages(selectedRoom.chatRoomId);
      }
    };

    setChatMessageHandler(handleMessage);
  }, [selectedRoom, setChatMessageHandler]);

  useEffect(() => {
    scrollToBottom();
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
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const selectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    await loadMessages(room.chatRoomId);
    // Mark messages as read
    try {
      await chatService.markMessagesAsRead(room.chatRoomId);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;

    // Determine the receiver (the other user in the chat room)
    const receiverId = selectedRoom.user1Id === user.userId 
      ? selectedRoom.user2Id 
      : selectedRoom.user1Id;

    try {
      const message = await chatService.sendMessage({
        receiverId,
        content: newMessage.trim()
      });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      const searchResults = await chatService.searchUsers(query);
      setUsers(searchResults);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const startNewChat = async (selectedUser: User) => {
    try {
      const room = await chatService.getOrCreateChatRoom(selectedUser.userId);
      setChatRooms(prev => [room, ...prev.filter(r => r.chatRoomId !== room.chatRoomId)]);
      setSelectedRoom(room);
      await loadMessages(room.chatRoomId);
      setCurrentTab(0); // Switch to Messages tab
    } catch (error) {
      console.error('Failed to start new chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOtherUser = (room: ChatRoom) => {
    if (!user) return room.user1;
    return room.user1Id === user.userId ? room.user2 : room.user1;
  };

  const isUserOnline = (userId: number) => {
    return onlineUsers.has(userId);
  };

  const isUserTyping = (userId: number) => {
    return Array.from(typingUsers.values()).some(indicator => indicator.userId === userId);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Messages
      </Typography>
      
      <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header with Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label="Messages" />
            <Tab label="New Chat" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <TabPanel value={currentTab} index={0}>
            <Box sx={{ display: 'flex', height: '60vh' }}>
              {/* Chat List */}
              <Box sx={{ width: '33%', borderRight: 1, borderColor: 'divider' }}>
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                  <List>
                    {chatRooms.map((room) => {
                      const otherUser = getOtherUser(room);
                      return (
                        <ListItemButton
                          key={room.chatRoomId}
                          selected={selectedRoom?.chatRoomId === room.chatRoomId}
                          onClick={() => selectRoom(room)}
                        >
                          <ListItemAvatar>
                            <Badge
                              color="success"
                              variant="dot"
                              invisible={!isUserOnline(otherUser.userId)}
                            >
                              <Avatar src={getProfilePictureUrl(otherUser.profilePicture)}>
                                {otherUser.firstName?.charAt(0)}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${otherUser.firstName} ${otherUser.lastName}`}
                            secondary={room.lastMessage || 'No messages yet'}
                            secondaryTypographyProps={{
                              noWrap: true,
                              sx: { maxWidth: '150px' }
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Box>
              </Box>

              {/* Chat Messages */}
              <Box sx={{ width: '67%' }}>
                {selectedRoom ? (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Chat Header */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {(() => {
                          const otherUser = getOtherUser(selectedRoom);
                          return (
                            <>
                              <Badge
                                color="success"
                                variant="dot"
                                invisible={!isUserOnline(otherUser.userId)}
                              >
                                <Avatar src={getProfilePictureUrl(otherUser.profilePicture)}>
                                  {otherUser.firstName?.charAt(0)}
                                </Avatar>
                              </Badge>
                              <Box>
                                <Typography variant="h6">
                                  {otherUser.firstName} {otherUser.lastName}
                                </Typography>
                                {isUserTyping(otherUser.userId) && (
                                  <Typography variant="caption" color="primary">
                                    Typing...
                                  </Typography>
                                )}
                              </Box>
                            </>
                          );
                        })()}
                      </Box>
                    </Box>

                    {/* Messages */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                      {messages.map((message) => (
                        <Box
                          key={message.messageId}
                          sx={{
                            display: 'flex',
                            justifyContent: message.senderId === user?.userId ? 'flex-end' : 'flex-start',
                            mb: 1
                          }}
                        >
                          <Paper
                            sx={{
                              p: 1,
                              maxWidth: '70%',
                              bgcolor: message.senderId === user?.userId ? 'primary.main' : 'grey.100',
                              color: message.senderId === user?.userId ? 'white' : 'text.primary'
                            }}
                          >
                            <Typography variant="body1">{message.content}</Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                textAlign: 'right',
                                opacity: 0.8
                              }}
                            >
                              {formatMessageTime(message.sentAt)}
                              {message.senderId === user?.userId && message.status === 2 && ' ✓✓'}
                              {message.senderId === user?.userId && message.status === 1 && ' ✓'}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                      <div ref={messagesEndRef} />
                    </Box>

                    {/* Message Input */}
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          multiline
                          maxRows={3}
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                        />
                        <IconButton 
                          color="primary" 
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: '100%', 
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

          <TabPanel value={currentTab} index={1}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <TextField
                fullWidth
                placeholder="Search users to start a new chat..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />
                }}
                sx={{ mb: 2 }}
              />

              <List>
                {users.map((searchUser) => (
                  <ListItemButton
                    key={searchUser.userId}
                    onClick={() => startNewChat(searchUser)}
                  >
                    <ListItemAvatar>
                      <Badge
                        color="success"
                        variant="dot"
                        invisible={!isUserOnline(searchUser.userId)}
                      >
                        <Avatar src={getProfilePictureUrl(searchUser.profilePicture)}>
                          {searchUser.firstName?.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${searchUser.firstName} ${searchUser.lastName}`}
                      secondary={searchUser.location}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default Messages; 