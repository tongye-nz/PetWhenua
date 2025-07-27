import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Typography,
  IconButton,
  Slide
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useSignalR } from '../../../../contexts/SignalRContext';
import { NotificationType, type Notification } from '../../../../models/notification.types';

interface NotificationToastProps {
  autoHideDuration?: number;
  maxToasts?: number;
}

interface ToastNotification extends Notification {
  toastId: string;
  show: boolean;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  autoHideDuration = 5000,
  maxToasts = 3
}) => {
  const { setNotificationHandler } = useSignalR();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    // Set up the notification handler for real-time notifications
    setNotificationHandler((notification: Notification) => {
      const toastId = `toast-${notification.notificationId}-${Date.now()}`;
      const newToast: ToastNotification = {
        ...notification,
        toastId,
        show: true
      };

      setToasts(prev => {
        // Limit number of toasts
        const updatedToasts = [newToast, ...prev.slice(0, maxToasts - 1)];
        return updatedToasts;
      });

      // Auto-hide after duration
      setTimeout(() => {
        setToasts(prev => 
          prev.map(toast => 
            toast.toastId === toastId 
              ? { ...toast, show: false }
              : toast
          )
        );
      }, autoHideDuration);

      // Remove from DOM after animation
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.toastId !== toastId));
      }, autoHideDuration + 300);
    });
  }, [setNotificationHandler, autoHideDuration, maxToasts]);

  const handleClose = (toastId: string) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.toastId === toastId 
          ? { ...toast, show: false }
          : toast
      )
    );

    // Remove from DOM after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.toastId !== toastId));
    }, 300);
  };

  const getNotificationSeverity = (type: number) => {
    switch (type) {
      case NotificationType.PetConnectionApproved:
      case NotificationType.PetWeddingApproved:
      case NotificationType.MeetupActivated:
      case NotificationType.UserFollowed:
        return 'success';
      case NotificationType.PetConnectionRejected:
      case NotificationType.PetWeddingRejected:
      case NotificationType.MeetupRejected:
        return 'error';
      case NotificationType.PetConnectionRequest:
      case NotificationType.PetWeddingPendingApproval:
      case NotificationType.MeetupPendingActivation:
        return 'warning';
      case NotificationType.PostLiked:
      case NotificationType.PostCommented:
      case NotificationType.ChatMessage:
        return 'info';
      default:
        return 'info';
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
      case NotificationType.MeetupRejected:
        return '❌';
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

  if (toasts.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
      }}
    >
      {toasts.map((toast) => (
        <Slide
          key={toast.toastId}
          direction="left"
          in={toast.show}
          timeout={300}
        >
          <Alert
            severity={getNotificationSeverity(toast.type)}
            action={
              <IconButton
                size="small"
                onClick={() => handleClose(toast.toastId)}
                sx={{ color: 'inherit' }}
              >
                <Close fontSize="small" />
              </IconButton>
            }
            sx={{
              mb: 1,
              boxShadow: 3,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              '& .MuiAlert-icon': {
                fontSize: '1.2rem',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ fontSize: '1.1rem', lineHeight: 1, mt: 0.2 }}>
                {getNotificationIcon(toast.type)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ mb: 0.5 }}
                >
                  {toast.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {toast.message}
                </Typography>
              </Box>
            </Box>
          </Alert>
        </Slide>
      ))}
    </Box>
  );
};

export default NotificationToast; 