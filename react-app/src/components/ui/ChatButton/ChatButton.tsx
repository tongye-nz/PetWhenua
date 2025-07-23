import React, { useState } from 'react';
import { IconButton, Tooltip, Badge } from '@mui/material';
import { Chat, ChatBubble } from '@mui/icons-material';
import { ChatDialog } from '../../features/chat';
import { chatService } from '../../../api/chat.api';
import { useAuth } from '../../../contexts/AuthContext';

interface ChatButtonProps {
  userId?: number;
  variant?: 'icon' | 'fab';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'default';
  showUnreadBadge?: boolean;
  tooltip?: string;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  userId,
  variant = 'icon',
  size = 'medium',
  color = 'primary',
  showUnreadBadge = false,
  tooltip = 'Open chat'
}) => {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Load unread count if showing badge and user is authenticated
  React.useEffect(() => {
    if (showUnreadBadge && user) {
      loadUnreadCount();
      // Set up interval to periodically check for new messages
      const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [showUnreadBadge, user]);

  const loadUnreadCount = async () => {
    if (!user) return; // Additional safety check
    
    try {
      const count = await chatService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleChatOpen = () => {
    if (!user) return; // Safety check
    
    setChatOpen(true);
    // Reset unread count when opening chat
    if (showUnreadBadge) {
      setUnreadCount(0);
    }
  };

  const handleChatClose = () => {
    setChatOpen(false);
  };

  // Don't render chat button for unauthenticated users
  // Important: This check comes AFTER all hooks to avoid Rules of Hooks violation
  if (!user) {
    return null;
  }

  const ChatIcon = variant === 'fab' ? ChatBubble : Chat;

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          color={color}
          size={size}
          onClick={handleChatOpen}
          sx={{
            ...(variant === 'fab' && {
              position: 'fixed',
              bottom: 16,
              right: 16,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              width: 56,
              height: 56,
              zIndex: 1000
            })
          }}
        >
          {showUnreadBadge ? (
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <ChatIcon />
            </Badge>
          ) : (
            <ChatIcon />
          )}
        </IconButton>
      </Tooltip>

      <ChatDialog
        open={chatOpen}
        onClose={handleChatClose}
        initialUserId={userId}
      />
    </>
  );
}; 