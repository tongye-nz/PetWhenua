import type { Meta, StoryObj } from '@storybook/react-vite';
import Text from './Text';

const meta = {
  title: 'UI/Text',
  component: Text,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A typography component built on top of Material-UI Typography with customizable variants, colors, and weights.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2', 'caption', 'overline'],
      description: 'The typography variant',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success', 'text.primary', 'text.secondary'],
      description: 'The text color',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'bold'],
      description: 'Font weight',
    },
  },
  args: {
    children: 'Sample text content',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is default body text',
  },
};

export const Heading1: Story = {
  args: {
    variant: 'h1',
    children: 'Heading 1',
  },
};

export const Heading2: Story = {
  args: {
    variant: 'h2',
    children: 'Heading 2',
  },
};

export const Heading3: Story = {
  args: {
    variant: 'h3',
    children: 'Heading 3',
  },
};

export const Body1: Story = {
  args: {
    variant: 'body1',
    children: 'Body 1 text for main content',
  },
};

export const Body2: Story = {
  args: {
    variant: 'body2',
    children: 'Body 2 text for secondary content',
  },
};

export const Caption: Story = {
  args: {
    variant: 'caption',
    children: 'Caption text for small details',
  },
};

export const Overline: Story = {
  args: {
    variant: 'overline',
    children: 'Overline text',
  },
};

export const Primary: Story = {
  args: {
    color: 'primary',
    children: 'Primary colored text',
  },
};

export const Secondary: Story = {
  args: {
    color: 'secondary',
    children: 'Secondary colored text',
  },
};

export const Error: Story = {
  args: {
    color: 'error',
    children: 'Error colored text',
  },
};

export const Bold: Story = {
  args: {
    weight: 'bold',
    children: 'Bold weighted text',
  },
};

export const Light: Story = {
  args: {
    weight: 'light',
    children: 'Light weighted text',
  },
};

export const Centered: Story = {
  args: {
    align: 'center',
    children: 'Centered text alignment',
  },
};

export const AllHeadings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Text variant="h1">Heading 1</Text>
      <Text variant="h2">Heading 2</Text>
      <Text variant="h3">Heading 3</Text>
      <Text variant="h4">Heading 4</Text>
      <Text variant="h5">Heading 5</Text>
      <Text variant="h6">Heading 6</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All heading variants displayed together for comparison.',
      },
    },
  },
};

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Text color="primary">Primary color text</Text>
      <Text color="secondary">Secondary color text</Text>
      <Text color="error">Error color text</Text>
      <Text color="warning">Warning color text</Text>
      <Text color="info">Info color text</Text>
      <Text color="success">Success color text</Text>
      <Text color="text.primary">Primary text color</Text>
      <Text color="text.secondary">Secondary text color</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All color variants displayed together for comparison.',
      },
    },
  },
};

export const AllWeights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Text weight="light">Light weight text</Text>
      <Text weight="regular">Regular weight text</Text>
      <Text weight="medium">Medium weight text</Text>
      <Text weight="bold">Bold weight text</Text>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All font weights displayed together for comparison.',
      },
    },
  },
}; 