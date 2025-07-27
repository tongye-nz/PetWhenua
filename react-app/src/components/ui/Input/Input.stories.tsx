import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import Input from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable input component built on top of Material-UI TextField with consistent styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'outlined', 'filled'],
      description: 'The visual style variant of the input',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'The type of input',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'The size of the input',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input is in an error state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the input should take full width',
    },
    multiline: {
      control: 'boolean',
      description: 'Whether the input is multiline (textarea)',
    },
    rows: {
      control: 'number',
      description: 'Number of rows for multiline input',
    },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default Input',
    placeholder: 'Enter text...',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    label: 'Outlined Input',
    placeholder: 'Enter text...',
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    label: 'Filled Input',
    placeholder: 'Enter text...',
  },
};

export const Standard: Story = {
  args: {
    variant: 'standard',
    label: 'Standard Input',
    placeholder: 'Enter text...',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Input with Helper Text',
    placeholder: 'Enter your email...',
    helperText: 'We will never share your email with anyone else.',
  },
};

export const Required: Story = {
  args: {
    label: 'Required Input',
    placeholder: 'This field is required',
    required: true,
    helperText: 'This field is required',
  },
};

export const Error: Story = {
  args: {
    label: 'Input with Error',
    placeholder: 'Enter valid email...',
    error: true,
    helperText: 'Please enter a valid email address',
    value: 'invalid-email',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    disabled: true,
    value: 'Disabled value',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    label: 'Email Address',
    placeholder: 'user@example.com',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    label: 'Age',
    placeholder: 'Enter your age...',
  },
};

export const Multiline: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    multiline: true,
    rows: 4,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'This input takes full width',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Small Input',
    placeholder: 'Small size input...',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Input variant="outlined" label="Outlined" placeholder="Outlined input..." />
      <Input variant="filled" label="Filled" placeholder="Filled input..." />
      <Input variant="standard" label="Standard" placeholder="Standard input..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All input variants displayed together for comparison.',
      },
    },
  },
}; 