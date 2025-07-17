import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { cyan, pink, lightGreen, indigo, orange, blueGrey } from '@mui/material/colors';
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
      case PostStatus.Pending: return 'warning';
      default: return 'default';
    }
  };



  const getCustomPostTypeStyles = (type: PostType) => {
    switch (type) {
      case PostType.Meetup:
        return { backgroundColor: cyan[500], color: '#ffffff' };
      case PostType.PetWedding:
        return { backgroundColor: pink[500], color: '#ffffff' };
      case PostType.BuySell:
        return { backgroundColor: lightGreen[500], color: '#ffffff' };
      case PostType.Library:
        return { backgroundColor: indigo[500], color: '#ffffff' };
      case PostType.Announcement:
        return { backgroundColor: orange[500], color: '#ffffff' };
      case PostType.Moment:
        return { backgroundColor: blueGrey[500], color: '#ffffff' };
      default:
        return {};
    }
  };

  if (statusVariant === 'type' && postType !== undefined) {
    // Use custom colors for post types
    const customStyles = getCustomPostTypeStyles(postType);
    return (
      <Chip
        size="small"
        sx={customStyles}
        {...props}
      />
    );
  } else if (statusVariant === 'status' && status !== undefined) {
    // Use standard MUI colors for status
    const color = getStatusColor(status);
    return (
      <Chip
        color={color as any}
        size="small"
        {...props}
      />
    );
  } else {
    // Default case
    return (
      <Chip
        color="default"
        size="small"
        {...props}
      />
    );
  }
};

export default StatusChip;
