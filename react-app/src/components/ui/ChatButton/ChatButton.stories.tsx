import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { IconButton, Tooltip, Badge } from '@mui/material';
import { Chat, ChatBubble } from '@mui/icons-material';

// Mock ChatButton component for Storybook that bypasses auth requirements
interface ChatButtonProps {
  userId?: number;
  variant?: 'icon' | 'fab';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'default';
  showUnreadBadge?: boolean;
  tooltip?: string;
  onClick?: () => void;
}

const MockChatButton: React.FC<ChatButtonProps> = ({
  userId: _userId, // Prefixed with underscore to indicate intentionally unused in mock
  variant = 'icon',
  size = 'medium',
  color = 'primary',
  showUnreadBadge = false,
  tooltip = 'Open chat',
  onClick = fn()
}) => {
  const [unreadCount] = React.useState(3); // Mock unread count
  const ChatIcon = variant === 'fab' ? ChatBubble : Chat;

  return (
    <Tooltip title={tooltip}>
      <IconButton
        color={color}
        size={size}
        onClick={onClick}
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
  );
};

const meta = {
  title: 'UI/ChatButton',
  component: MockChatButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A chat button component that opens a chat dialog and can display unread message count. This is a mocked version for Storybook that shows the visual appearance without authentication requirements.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    userId: {
      control: 'number',
      description: 'The ID of the user to chat with',
    },
    variant: {
      control: 'select',
      options: ['icon', 'fab'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the button',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'default'],
      description: 'Color of the button',
    },
    showUnreadBadge: {
      control: 'boolean',
      description: 'Whether to show unread message count badge',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text for the button',
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when button is clicked',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', minHeight: '200px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: 'icon',
    size: 'medium',
    color: 'primary',
    showUnreadBadge: false,
    tooltip: 'Open chat',
    onClick: fn(),
  },
} satisfies Meta<typeof MockChatButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithUnreadBadge: Story = {
  args: {
    showUnreadBadge: true,
  },
};

export const FloatingActionButton: Story = {
  args: {
    variant: 'fab',
    showUnreadBadge: true,
  },
  decorators: [
    (Story) => (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px', 
        minHeight: '200px', 
        position: 'relative',
        width: '300px',
        height: '200px'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          FAB button positioned at bottom-right corner
        </p>
        <Story />
      </div>
    ),
  ],
};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
  },
};

export const CustomTooltip: Story = {
  args: {
    tooltip: 'Start a conversation',
  },
};

export const WithUserId: Story = {
  args: {
    userId: 123,
    tooltip: 'Chat with User #123',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <MockChatButton variant="icon" size="small" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Icon (Small)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <MockChatButton variant="icon" size="medium" showUnreadBadge />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Icon with Badge</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <MockChatButton variant="icon" size="large" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Icon (Large)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <MockChatButton variant="icon" color="secondary" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Secondary Color</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All chat button variants displayed together for comparison (excluding FAB which needs fixed positioning).',
      },
    },
  },
}; 