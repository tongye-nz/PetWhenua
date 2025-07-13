import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { PostStatus, PostType } from '../../../models/post.types';

export interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status?: PostStatus;
  postType?: PostType;
  statusVariant?: 'status' | 'type';
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  postType,
  statusVariant = 'status',
  ...props
}) => {
  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case PostStatus.Active: return 'success';
      case PostStatus.Sold: return 'info';
      case PostStatus.Expired: return 'error';
      case PostStatus.Inactive: return 'warning';
      case PostStatus.Cancelled: return 'error';
      default: return 'default';
    }
  };

  const getPostTypeColor = (type: PostType) => {
    switch (type) {
      case PostType.Meetup: return 'primary';
      case PostType.BuySell: return 'secondary';
      case PostType.Library: return 'info';
      case PostType.Announcement: return 'warning';
      default: return 'default';
    }
  };

  const color = statusVariant === 'status' && status !== undefined 
    ? getStatusColor(status) 
    : statusVariant === 'type' && postType !== undefined 
    ? getPostTypeColor(postType) 
    : 'default';

  return (
    <Chip
      color={color as any}
      size="small"
      {...props}
    />
  );
};

export default StatusChip;
