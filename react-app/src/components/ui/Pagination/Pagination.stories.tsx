import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Pagination } from './Pagination';
import type { PaginationInfo } from '../../../models/pagination.types';

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A pagination component with page navigation and page size selector. Shows result count and provides controls for navigating through paginated data.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    pagination: {
      control: 'object',
      description: 'Pagination information object containing current page, total pages, etc.',
    },
    onPageChange: {
      action: 'page-changed',
      description: 'Function called when page number changes',
    },
    onPageSizeChange: {
      action: 'page-size-changed',
      description: 'Function called when page size changes',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', minWidth: '600px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          Sample content would be here...
        </div>
        <Story />
      </div>
    ),
  ],
  args: {
    onPageChange: fn(),
    onPageSizeChange: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create pagination info
const createPagination = (
  currentPage: number,
  pageSize: number,
  totalCount: number
): PaginationInfo => {
  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

export const FirstPage: Story = {
  args: {
    pagination: createPagination(1, 10, 150),
  },
};

export const MiddlePage: Story = {
  args: {
    pagination: createPagination(5, 10, 150),
  },
};

export const LastPage: Story = {
  args: {
    pagination: createPagination(15, 10, 150),
  },
};

export const SinglePage: Story = {
  args: {
    pagination: createPagination(1, 10, 8),
  },
};

export const LargePageSize: Story = {
  args: {
    pagination: createPagination(1, 30, 150),
  },
};

export const SmallDataset: Story = {
  args: {
    pagination: createPagination(2, 10, 25),
  },
};

export const EmptyResults: Story = {
  args: {
    pagination: createPagination(1, 10, 0),
  },
};

export const LargeDataset: Story = {
  args: {
    pagination: createPagination(50, 20, 2000),
  },
};

export const AllStates: Story = {
  args: {
    pagination: createPagination(1, 10, 150),
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '700px' }}>
      <div>
        <h3>First Page (1 of 15)</h3>
        <Pagination
          pagination={createPagination(1, 10, 150)}
          onPageChange={fn()}
          onPageSizeChange={fn()}
        />
      </div>
      
      <div>
        <h3>Middle Page (5 of 15)</h3>
        <Pagination
          pagination={createPagination(5, 10, 150)}
          onPageChange={fn()}
          onPageSizeChange={fn()}
        />
      </div>
      
      <div>
        <h3>Last Page (15 of 15)</h3>
        <Pagination
          pagination={createPagination(15, 10, 150)}
          onPageChange={fn()}
          onPageSizeChange={fn()}
        />
      </div>
      
      <div>
        <h3>Single Page (only 8 items)</h3>
        <Pagination
          pagination={createPagination(1, 10, 8)}
          onPageChange={fn()}
          onPageSizeChange={fn()}
        />
      </div>
      
      <div>
        <h3>Large Page Size (30 per page)</h3>
        <Pagination
          pagination={createPagination(1, 30, 150)}
          onPageChange={fn()}
          onPageSizeChange={fn()}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All possible states of the Pagination component displayed together.',
      },
    },
  },
}; 