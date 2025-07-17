import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { grey } from '@mui/material/colors';
import {
  Notifications as NotificationsIcon,
  NotificationsNone,
  Check,
  Clear,
  MarkEmailRead
} from '@mui/icons-material';
import { useSignalR } from '../../../../contexts/SignalRContext';
import { notificationService } from '../../../../api/notification.api';
import { NotificationType, NotificationStatus, type Notification } from '../../../../models/notification.types';
import { formatDate } from '../../../../utils/dateUtils';

interface NotificationCenterProps {
  maxDisplayCount?: number;
  autoRefresh?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  maxDisplayCount = 10,
  autoRefresh = true
}) => {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    removeNotification,
    isConnected
  } = useSignalR();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const isOpen = Boolean(anchorEl);
  const intervalRef = useRef<number | null>(null);

  // Load initial notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  // Auto-refresh notifications periodically
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadNotifications(true);
      }, 30000); // Refresh every 30 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh]);

  // Update display notifications when SignalR notifications change
  useEffect(() => {
    setDisplayNotifications(notifications.slice(0, maxDisplayCount));
  }, [notifications, maxDisplayCount]);

  const loadNotifications = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(silent);
      setError(null);

      const fetchedNotifications = await notificationService.getUnreadNotifications();
      setDisplayNotifications(fetchedNotifications.slice(0, maxDisplayCount));
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (displayNotifications.length === 0) {
      loadNotifications();
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      markNotificationAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDismiss = async (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationService.dismissNotification(notificationId);
      removeNotification(notificationId);
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      // Update all notifications in context
      displayNotifications.forEach(notification => {
        if (notification.status === NotificationStatus.Unread) {
          markNotificationAsRead(notification.notificationId);
        }
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setError('Failed to mark all notifications as read');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: number) => {
    switch (type) {
      case NotificationType.PetConnectionRequest:
      case NotificationType.PetConnectionApproved:
      case NotificationType.PetConnectionRejected:
        return '🐾';
      case NotificationType.PetWeddingPendingApproval:
      case NotificationType.PetWeddingApproved:
      case NotificationType.PetWeddingRejected:
        return '💍';
      case NotificationType.MeetupPendingActivation:
      case NotificationType.MeetupActivated:
        return '📅';
      case NotificationType.PostLiked:
        return '❤️';
      case NotificationType.PostCommented:
        return '💬';
      case NotificationType.UserFollowed:
        return '👥';
      case NotificationType.ChatMessage:
        return '📨';
      default:
        return '📢';
    }
  };



  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (notification.status === NotificationStatus.Unread) {
      handleMarkAsRead(notification.notificationId, { stopPropagation: () => {} } as React.MouseEvent);
    }

    // Navigate based on notification type
    // TODO: Add navigation logic based on notification type
    handleMenuClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleMenuOpen}
        sx={{ color: grey[900] }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon />
              Notifications
              {!isConnected && (
                <Chip size="small" label="Offline" color="warning" />
              )}
            </Typography>
            {refreshing && <CircularProgress size={16} />}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<MarkEmailRead />}
              onClick={handleMarkAllAsRead}
              disabled={loading}
              sx={{ mt: 1 }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ m: 1 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && !refreshing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Notifications List */}
        {!loading && (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {displayNotifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              displayNotifications.map((notification, index) => (
                <React.Fragment key={notification.notificationId}>
                  <MenuItem
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      alignItems: 'flex-start',
                      p: 2,
                      backgroundColor: notification.status === NotificationStatus.Unread ? 'action.hover' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ fontSize: '1.2rem', mt: 0.5 }}>
                          {getNotificationIcon(notification.type)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            fontWeight={notification.status === NotificationStatus.Unread ? 'bold' : 'normal'}
                            sx={{ mb: 0.5 }}
                          >
                            {notification.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {notification.status === NotificationStatus.Unread && (
                            <IconButton
                              size="small"
                              onClick={(e) => handleMarkAsRead(notification.notificationId, e)}
                              title="Mark as read"
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={(e) => handleDismiss(notification.notificationId, e)}
                            title="Dismiss"
                          >
                            <Clear fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </MenuItem>
                  {index < displayNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </Box>
        )}

        {/* Footer */}
        {displayNotifications.length > 0 && (
          <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Button size="small" onClick={handleMenuClose}>
              View All Notifications
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter; 