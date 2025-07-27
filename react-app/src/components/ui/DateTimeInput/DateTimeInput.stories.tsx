import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import DateTimeInput from './DateTimeInput';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with timezone support for stories
dayjs.extend(utc);
dayjs.extend(timezone);

const meta = {
  title: 'UI/DateTimeInput',
  component: DateTimeInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A date and time picker component that handles New Zealand timezone conversion. Values are stored in UTC but displayed in NZ time.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the date time input',
    },
    value: {
      control: 'text',
      description: 'Current value in ISO string format (UTC)',
    },
    onChange: {
      action: 'changed',
      description: 'Function called when the date/time changes',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input is in error state',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the input',
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    min: {
      control: 'text',
      description: 'Minimum allowed date/time in ISO string format',
    },
    max: {
      control: 'text',
      description: 'Maximum allowed date/time in ISO string format',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', minWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof DateTimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Event Date & Time',
    value: '',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Meeting Date & Time',
    value: dayjs().add(1, 'day').utc().toISOString(),
  },
};

export const Required: Story = {
  args: {
    label: 'Appointment Date & Time',
    value: '',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Event Date & Time',
    value: '',
    error: true,
    helperText: 'Please select a valid date and time',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Date & Time',
    value: dayjs().utc().toISOString(),
    disabled: true,
  },
};

export const WithMinMax: Story = {
  args: {
    label: 'Booking Date & Time',
    value: '',
    min: dayjs().utc().toISOString(), // Now
    max: dayjs().add(30, 'days').utc().toISOString(), // 30 days from now
    helperText: 'Select a date within the next 30 days',
  },
};

export const CustomLabel: Story = {
  args: {
    label: 'Pet Wedding Ceremony Time',
    value: '',
    helperText: 'When should the ceremony begin?',
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '400px' }}>
      <div>
        <h3>Default</h3>
        <DateTimeInput
          label="Event Date & Time"
          value=""
          onChange={fn()}
        />
      </div>
      
      <div>
        <h3>With Value</h3>
        <DateTimeInput
          label="Meeting Date & Time"
          value={dayjs().add(1, 'day').utc().toISOString()}
          onChange={fn()}
        />
      </div>
      
      <div>
        <h3>Required with Error</h3>
        <DateTimeInput
          label="Required Date & Time"
          value=""
          onChange={fn()}
          required
          error
          helperText="This field is required"
        />
      </div>
      
      <div>
        <h3>Disabled</h3>
        <DateTimeInput
          label="Disabled Date & Time"
          value={dayjs().utc().toISOString()}
          onChange={fn()}
          disabled
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All possible states of the DateTimeInput component displayed together.',
      },
    },
  },
}; 