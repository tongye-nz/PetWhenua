import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import LocationInput from './LocationInput';





// Simple wrapper for stories - component will handle missing auth gracefully
const MockAuthProvider: React.FC<{ 
  children: React.ReactNode;
}> = ({ children }) => {
  return <div>{children}</div>;
};

// Mock localStorage for consistent behavior in Storybook
const mockLocalStorage = {
  getItem: (key: string) => {
    if (key === 'recentLocations') {
      return JSON.stringify([
        'Wellington, Wellington Region',
        'Christchurch, Canterbury Region',
        'Hamilton, Waikato Region',
        'Tauranga, Bay of Plenty Region'
      ]);
    }
    return null;
  },
  setItem: fn(),
  removeItem: fn(),
  clear: fn(),
  length: 0,
  key: () => null,
};

// Override localStorage for Storybook
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

const meta = {
  title: 'UI/LocationInput',
  component: LocationInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A location input component with autocomplete suggestions from user profile and recent locations. Stores recent selections in localStorage.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the location input',
    },
    value: {
      control: 'text',
      description: 'Current value of the input',
    },
    onChange: {
      action: 'changed',
      description: 'Function called when the value changes',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input is in error state',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the input',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the input should take full width',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
  },
  decorators: [
    (Story) => (
      <MockAuthProvider>
        <div style={{ padding: '20px', minWidth: '400px' }}>
          <Story />
        </div>
      </MockAuthProvider>
    ),
  ],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof LocationInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Auckland, Auckland Region',
  },
};

export const Required: Story = {
  args: {
    value: '',
    required: true,
    label: 'Event Location',
  },
};

export const WithError: Story = {
  args: {
    value: '',
    error: true,
    helperText: 'Please enter a valid location',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    value: 'Wellington, Wellington Region',
    disabled: true,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Where is your pet located?',
    label: 'Pet Location',
  },
};

export const NoFullWidth: Story = {
  args: {
    value: '',
    fullWidth: false,
  },
};

export const WithoutUserLocation: Story = {
  args: {
    value: '',
  },
  decorators: [
    (Story) => (
      <MockAuthProvider>
        <div style={{ padding: '20px', minWidth: '400px' }}>
          <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
            No user logged in - only recent locations will be suggested
          </p>
          <Story />
        </div>
      </MockAuthProvider>
    ),
  ],
};

export const UserWithoutLocation: Story = {
  args: {
    value: '',
  },
  decorators: [
    (Story) => (
      <MockAuthProvider>
        <div style={{ padding: '20px', minWidth: '400px' }}>
          <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
            User logged in but no location in profile
          </p>
          <Story />
        </div>
      </MockAuthProvider>
    ),
  ],
};

export const AllStates: Story = {
  args: {
    value: '',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '400px' }}>
      <div>
        <h3>Default</h3>
        <LocationInput
          value=""
          onChange={fn()}
        />
      </div>
      
      <div>
        <h3>With Value</h3>
        <LocationInput
          value="Auckland, Auckland Region"
          onChange={fn()}
        />
      </div>
      
      <div>
        <h3>Required with Error</h3>
        <LocationInput
          value=""
          onChange={fn()}
          required
          error
          helperText="Location is required"
        />
      </div>
      
      <div>
        <h3>Custom Label and Placeholder</h3>
        <LocationInput
          label="Event Venue"
          placeholder="Enter venue location"
          value=""
          onChange={fn()}
        />
      </div>
      
      <div>
        <h3>Disabled</h3>
        <LocationInput
          value="Wellington, Wellington Region"
          onChange={fn()}
          disabled
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All possible states of the LocationInput component displayed together.',
      },
    },
  },
}; 