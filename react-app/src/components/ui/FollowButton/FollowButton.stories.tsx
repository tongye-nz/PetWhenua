import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import FollowButton from './FollowButton';



// Note: API calls will use actual service in Storybook
// The component handles errors gracefully if API is unavailable

// Create a wrapper component that shows the button with some context
const StoryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f9f9f9', 
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        User Profile Actions
      </div>
      {children}
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
        Note: This is a mock version for Storybook demonstration
      </div>
    </div>
  );
};

const meta = {
  title: 'UI/FollowButton',
  component: FollowButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A follow/unfollow button component with loading states, success/error alerts, and event handling. Integrates with the user follow API.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    userId: {
      control: 'number',
      description: 'ID of the user to follow/unfollow',
    },
    isFollowing: {
      control: 'boolean',
      description: 'Current follow state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the button',
    },
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
      description: 'Visual variant of the button',
    },
    onFollowChange: {
      action: 'follow-changed',
      description: 'Callback function when follow state changes',
    },
  },
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
  args: {
    userId: 123,
    onFollowChange: fn(),
  },
} satisfies Meta<typeof FollowButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotFollowing: Story = {
  args: {
    isFollowing: false,
  },
};

export const Following: Story = {
  args: {
    isFollowing: true,
  },
};

export const Disabled: Story = {
  args: {
    isFollowing: false,
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    isFollowing: false,
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    isFollowing: false,
    size: 'large',
  },
};

export const OutlinedVariant: Story = {
  args: {
    isFollowing: false,
    variant: 'outlined',
  },
};

export const TextVariant: Story = {
  args: {
    isFollowing: false,
    variant: 'text',
  },
};

export const OutlinedFollowing: Story = {
  args: {
    isFollowing: true,
    variant: 'outlined',
  },
};

export const AllVariants: Story = {
  args: {
    userId: 123,
    isFollowing: false,
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '300px' }}>
      <div>
        <h3>Not Following States</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <FollowButton userId={1} isFollowing={false} onFollowChange={fn()} />
          <FollowButton userId={2} isFollowing={false} variant="outlined" onFollowChange={fn()} />
          <FollowButton userId={3} isFollowing={false} variant="text" onFollowChange={fn()} />
        </div>
      </div>
      
      <div>
        <h3>Following States</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <FollowButton userId={4} isFollowing={true} onFollowChange={fn()} />
          <FollowButton userId={5} isFollowing={true} variant="outlined" onFollowChange={fn()} />
          <FollowButton userId={6} isFollowing={true} variant="text" onFollowChange={fn()} />
        </div>
      </div>
      
      <div>
        <h3>Sizes</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <FollowButton userId={7} isFollowing={false} size="small" onFollowChange={fn()} />
          <FollowButton userId={8} isFollowing={false} size="medium" onFollowChange={fn()} />
          <FollowButton userId={9} isFollowing={false} size="large" onFollowChange={fn()} />
        </div>
      </div>
      
      <div>
        <h3>Disabled</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <FollowButton userId={10} isFollowing={false} disabled onFollowChange={fn()} />
          <FollowButton userId={11} isFollowing={true} disabled onFollowChange={fn()} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All possible states and variants of the FollowButton component displayed together.',
      },
    },
  },
}; 