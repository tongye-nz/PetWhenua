import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StatusChip from './StatusChip';

const meta = {
  title: 'UI/StatusChip',
  component: StatusChip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A status chip component that displays different states for posts, user roles, and content types with appropriate colors and styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    statusVariant: {
      control: 'select',
      options: ['status', 'type', 'role'],
      description: 'The variant of the status chip',
    },
    status: {
      control: 'select',
      options: ['Active', 'Sold', 'Expired', 'Inactive', 'Cancelled', 'Pending'],
      description: 'Post status',
    },
    postType: {
      control: 'select',
      options: ['Meetup', 'PetWedding', 'BuySell', 'Library', 'Announcement', 'Moment'],
      description: 'Post type',
    },
    userRole: {
      control: 'select',
      options: ['SITE_ADMIN', 'MEETUP_ADMIN', 'VET', 'MEMBER'],
      description: 'User role',
    },
  },
} satisfies Meta<typeof StatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StatusActive: Story = {
  args: {
    statusVariant: 'status',
    status: 'Active',
    label: 'Active',
  },
};

export const StatusSold: Story = {
  args: {
    statusVariant: 'status',
    status: 'Sold',
    label: 'Sold',
  },
};

export const StatusExpired: Story = {
  args: {
    statusVariant: 'status',
    status: 'Expired',
    label: 'Expired',
  },
};

export const StatusPending: Story = {
  args: {
    statusVariant: 'status',
    status: 'Pending',
    label: 'Pending',
  },
};

export const TypeMeetup: Story = {
  args: {
    statusVariant: 'type',
    postType: 'Meetup',
    label: 'Meetup',
  },
};

export const TypePetWedding: Story = {
  args: {
    statusVariant: 'type',
    postType: 'PetWedding',
    label: 'Pet Wedding',
  },
};

export const TypeBuySell: Story = {
  args: {
    statusVariant: 'type',
    postType: 'BuySell',
    label: 'Buy/Sell',
  },
};

export const TypeLibrary: Story = {
  args: {
    statusVariant: 'type',
    postType: 'Library',
    label: 'Library',
  },
};

export const TypeAnnouncement: Story = {
  args: {
    statusVariant: 'type',
    postType: 'Announcement',
    label: 'Announcement',
  },
};

export const RoleAdmin: Story = {
  args: {
    statusVariant: 'role',
    userRole: 'SITE_ADMIN',
  },
};

export const RoleMeetupAdmin: Story = {
  args: {
    statusVariant: 'role',
    userRole: 'MEETUP_ADMIN',
  },
};

export const RoleVet: Story = {
  args: {
    statusVariant: 'role',
    userRole: 'VET',
  },
};

export const RoleMember: Story = {
  args: {
    statusVariant: 'role',
    userRole: 'MEMBER',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <StatusChip statusVariant="status" status="Active" label="Active" />
      <StatusChip statusVariant="status" status="Sold" label="Sold" />
      <StatusChip statusVariant="status" status="Expired" label="Expired" />
      <StatusChip statusVariant="status" status="Inactive" label="Inactive" />
      <StatusChip statusVariant="status" status="Cancelled" label="Cancelled" />
      <StatusChip statusVariant="status" status="Pending" label="Pending" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All post status variants displayed together for comparison.',
      },
    },
  },
};

export const AllPostTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <StatusChip statusVariant="type" postType="Meetup" label="Meetup" />
      <StatusChip statusVariant="type" postType="PetWedding" label="Pet Wedding" />
      <StatusChip statusVariant="type" postType="BuySell" label="Buy/Sell" />
      <StatusChip statusVariant="type" postType="Library" label="Library" />
      <StatusChip statusVariant="type" postType="Announcement" label="Announcement" />
      <StatusChip statusVariant="type" postType="Moment" label="Moment" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All post type variants displayed together for comparison.',
      },
    },
  },
};

export const AllUserRoles: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <StatusChip statusVariant="role" userRole="SITE_ADMIN" />
      <StatusChip statusVariant="role" userRole="MEETUP_ADMIN" />
      <StatusChip statusVariant="role" userRole="VET" />
      <StatusChip statusVariant="role" userRole="MEMBER" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All user role variants displayed together for comparison.',
      },
    },
  },
}; 