import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import LikeButton from './LikeButton';

const meta = {
  title: 'UI/LikeButton',
  component: LikeButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A like button component with heart icon that allows users to like/unlike posts with visual feedback and count display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    postId: {
      control: 'number',
      description: 'The ID of the post to like',
    },
    initialLikeCount: {
      control: 'number',
      description: 'Initial number of likes',
    },
    initialIsLiked: {
      control: 'boolean',
      description: 'Whether the post is initially liked',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the like button',
    },
    showCount: {
      control: 'boolean',
      description: 'Whether to show the like count',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
  args: {
    postId: 1,
    onLikeChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LikeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialLikeCount: 5,
    initialIsLiked: false,
  },
};

export const Liked: Story = {
  args: {
    initialLikeCount: 12,
    initialIsLiked: true,
  },
};

export const NoLikes: Story = {
  args: {
    initialLikeCount: 0,
    initialIsLiked: false,
  },
};

export const HighLikeCount: Story = {
  args: {
    initialLikeCount: 156,
    initialIsLiked: true,
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    initialLikeCount: 8,
    initialIsLiked: false,
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
    initialLikeCount: 8,
    initialIsLiked: false,
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    initialLikeCount: 8,
    initialIsLiked: false,
  },
};

export const WithoutCount: Story = {
  args: {
    initialLikeCount: 25,
    initialIsLiked: false,
    showCount: false,
  },
};

export const Disabled: Story = {
  args: {
    initialLikeCount: 3,
    initialIsLiked: false,
    disabled: true,
  },
};

export const DisabledLiked: Story = {
  args: {
    initialLikeCount: 3,
    initialIsLiked: true,
    disabled: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <LikeButton postId={1} size="small" initialLikeCount={5} initialIsLiked={false} />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Small</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LikeButton postId={2} size="medium" initialLikeCount={12} initialIsLiked={true} />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LikeButton postId={3} size="large" initialLikeCount={8} initialIsLiked={false} />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Large</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All like button sizes displayed together for comparison.',
      },
    },
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <LikeButton postId={1} initialLikeCount={0} initialIsLiked={false} />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Unliked (0)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LikeButton postId={2} initialLikeCount={5} initialIsLiked={false} />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Unliked (5)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LikeButton postId={3} initialLikeCount={1} initialIsLiked={true} />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Liked (1)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LikeButton postId={4} initialLikeCount={25} initialIsLiked={true} />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Liked (25)</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LikeButton postId={5} initialLikeCount={3} initialIsLiked={false} disabled />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Disabled</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different states of the like button displayed together.',
      },
    },
  },
}; 