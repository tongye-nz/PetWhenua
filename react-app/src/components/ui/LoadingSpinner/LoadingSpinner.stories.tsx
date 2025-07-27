import type { Meta, StoryObj } from '@storybook/react-vite';
import LoadingSpinner from './LoadingSpinner';

const meta = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A loading spinner component built on top of Material-UI CircularProgress with customizable sizes and centering options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the loading spinner',
    },
    centered: {
      control: 'boolean',
      description: 'Whether to center the spinner in a container',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'inherit'],
      description: 'The color of the spinner',
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
  },
};

export const Centered: Story = {
  args: {
    centered: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Primary: Story = {
  args: {
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
  },
};

export const Error: Story = {
  args: {
    color: 'error',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="small" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Small</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="medium" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="large" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Large</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All spinner sizes displayed together for comparison.',
      },
    },
  },
};

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner color="primary" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Primary</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner color="secondary" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Secondary</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner color="error" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Error</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner color="warning" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Warning</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner color="info" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Info</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner color="success" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Success</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All spinner colors displayed together for comparison.',
      },
    },
  },
}; 