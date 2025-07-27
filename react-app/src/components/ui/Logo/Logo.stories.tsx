import type { Meta, StoryObj } from '@storybook/react-vite';
import Logo from './Logo';

const meta = {
  title: 'UI/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A logo component that displays the PetWhenua logo in various sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the logo',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the logo',
    },
  },
  args: {
    alt: 'PetWhenua',
  },
} satisfies Meta<typeof Logo>;

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

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Logo size="small" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Small</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Logo size="medium" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Logo size="large" />
        <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>Large</div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All logo sizes displayed together for comparison.',
      },
    },
  },
}; 