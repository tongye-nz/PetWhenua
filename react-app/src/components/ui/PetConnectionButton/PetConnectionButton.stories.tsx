import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import PetConnectionButton from './PetConnectionButton';

// Create a wrapper component that shows the button with some context
const StoryWrapper: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f9f9f9', 
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      minWidth: '300px'
    }}>
      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
        <strong>Pet Profile Actions</strong>
      </div>
      <div style={{ marginBottom: '10px', fontSize: '12px', color: '#999' }}>
        {title}
      </div>
      {children}
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
        Note: API calls are mocked for demonstration
      </div>
    </div>
  );
};

const meta = {
  title: 'UI/PetConnectionButton',
  component: PetConnectionButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A button for managing pet connections. Handles different connection states like pending, accepted, rejected, and blocked. Includes loading states and API integration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    myPetId: {
      control: 'number',
      description: 'ID of the current user\'s pet',
    },
    targetPetId: {
      control: 'number',
      description: 'ID of the pet to connect with',
    },
    connectionStatus: {
      control: 'select',
      options: [undefined, 'Pending', 'Accepted', 'Rejected', 'Blocked'],
      description: 'Current connection status between the pets',
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
    onConnectionChange: {
      action: 'connection-changed',
      description: 'Callback function when connection status changes',
    },
  },
  decorators: [
    (Story, { args }) => (
      <StoryWrapper title={`Status: ${args.connectionStatus || 'No connection'}`}>
        <Story />
      </StoryWrapper>
    ),
  ],
  args: {
    myPetId: 1,
    targetPetId: 2,
    onConnectionChange: fn(),
  },
} satisfies Meta<typeof PetConnectionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoConnection: Story = {
  args: {
    connectionStatus: undefined,
  },
};

export const PendingRequest: Story = {
  args: {
    connectionStatus: 'Pending',
  },
};

export const AcceptedConnection: Story = {
  args: {
    connectionStatus: 'Accepted',
  },
};

export const RejectedRequest: Story = {
  args: {
    connectionStatus: 'Rejected',
  },
};

export const BlockedConnection: Story = {
  args: {
    connectionStatus: 'Blocked',
  },
};

export const Disabled: Story = {
  args: {
    connectionStatus: undefined,
    disabled: true,
  },
};

export const SmallSize: Story = {
  args: {
    connectionStatus: undefined,
    size: 'small',
  },
};

export const LargeSize: Story = {
  args: {
    connectionStatus: undefined,
    size: 'large',
  },
};

export const ContainedVariant: Story = {
  args: {
    connectionStatus: undefined,
    variant: 'contained',
  },
};

export const TextVariant: Story = {
  args: {
    connectionStatus: undefined,
    variant: 'text',
  },
};

export const AllStates: Story = {
  args: {
    myPetId: 1,
    targetPetId: 2,
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '400px' }}>
      <div>
        <h3>Connection States</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h4>No Connection</h4>
            <PetConnectionButton 
              myPetId={1} 
              targetPetId={2} 
              onConnectionChange={fn()} 
            />
          </div>
          
          <div>
            <h4>Request Pending</h4>
            <PetConnectionButton 
              myPetId={1} 
              targetPetId={3} 
              connectionStatus="Pending"
              onConnectionChange={fn()} 
            />
          </div>
          
          <div>
            <h4>Connected</h4>
            <PetConnectionButton 
              myPetId={1} 
              targetPetId={4} 
              connectionStatus="Accepted"
              onConnectionChange={fn()} 
            />
          </div>
          
          <div>
            <h4>Request Rejected</h4>
            <PetConnectionButton 
              myPetId={1} 
              targetPetId={5} 
              connectionStatus="Rejected"
              onConnectionChange={fn()} 
            />
          </div>
          
          <div>
            <h4>Blocked</h4>
            <PetConnectionButton 
              myPetId={1} 
              targetPetId={6} 
              connectionStatus="Blocked"
              onConnectionChange={fn()} 
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3>Variants & Sizes</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <PetConnectionButton 
            myPetId={1} 
            targetPetId={7} 
            variant="outlined" 
            size="small"
            onConnectionChange={fn()} 
          />
          <PetConnectionButton 
            myPetId={1} 
            targetPetId={8} 
            variant="contained" 
            size="medium"
            onConnectionChange={fn()} 
          />
          <PetConnectionButton 
            myPetId={1} 
            targetPetId={9} 
            variant="text" 
            size="large"
            onConnectionChange={fn()} 
          />
        </div>
      </div>
      
      <div>
        <h3>Disabled State</h3>
        <PetConnectionButton 
          myPetId={1} 
          targetPetId={10} 
          disabled
          onConnectionChange={fn()} 
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All possible states and variants of the PetConnectionButton component displayed together.',
      },
    },
  },
}; 