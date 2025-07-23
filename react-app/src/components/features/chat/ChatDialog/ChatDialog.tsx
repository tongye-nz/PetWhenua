import React from 'react';
import { UnifiedChat } from '../UnifiedChat';

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
  initialUserId?: number;
}

export const ChatDialog: React.FC<ChatDialogProps> = (props) => {
  return (
    <UnifiedChat 
      mode="dialog"
      {...props}
    />
  );
}; 