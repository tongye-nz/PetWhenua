import React from 'react';
import { UnifiedChat } from '../UnifiedChat';

interface ChatPageProps {
  title?: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({ title = "Messages" }) => {
  return (
    <UnifiedChat 
      mode="page"
      title={title}
    />
  );
}; 