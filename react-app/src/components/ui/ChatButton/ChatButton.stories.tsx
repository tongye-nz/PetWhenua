import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { ChatButton } from './ChatButton';

const meta = {
  title: 'UI/ChatButton',
  component: ChatButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A chat button component that opens a chat dialog and can display unread message count.',
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
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', minHeight: '200px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatButton>;

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
        <ChatButton variant="icon" size="small" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Icon (Small)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ChatButton variant="icon" size="medium" showUnreadBadge />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Icon with Badge</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ChatButton variant="fab" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>FAB</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ChatButton variant="fab" showUnreadBadge />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>FAB with Badge</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All chat button variants displayed together for comparison.',
      },
    },
  },
}; 