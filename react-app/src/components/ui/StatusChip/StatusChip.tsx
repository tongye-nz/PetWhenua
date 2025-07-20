import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { cyan, pink, lightGreen, indigo, orange, blueGrey } from '@mui/material/colors';
import { 
  PostStatus, 
  PostType,
  PostStatusUtils,
  PostTypeUtils 
} from '../../../models/post.types';
import type { 
  PostStatusString, 
  PostTypeString
} from '../../../models/post.types';

export interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status?: PostStatus | PostStatusString;
  postType?: PostType | PostTypeString;
  statusVariant?: 'status' | 'type';
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  postType,
  statusVariant = 'status',
  ...props
}) => {
  const getStatusColor = (status: PostStatus | PostStatusString) => {
    if (PostStatusUtils.isActive(status)) return 'success';
    if (PostStatusUtils.isSold(status)) return 'info';
    if (PostStatusUtils.isExpired(status)) return 'error';
    if (PostStatusUtils.isInactive(status)) return 'warning';
    if (PostStatusUtils.isCancelled(status)) return 'error';
    if (PostStatusUtils.isPending(status)) return 'warning';
    return 'default';
  };

  const getCustomPostTypeStyles = (type: PostType | PostTypeString) => {
    if (PostTypeUtils.isMeetup(type)) {
      return { backgroundColor: cyan[500], color: '#ffffff' };
    }
    if (PostTypeUtils.isPetWedding(type)) {
      return { backgroundColor: pink[500], color: '#ffffff' };
    }
    if (PostTypeUtils.isBuySell(type)) {
      return { backgroundColor: lightGreen[500], color: '#ffffff' };
    }
    if (PostTypeUtils.isLibrary(type)) {
      return { backgroundColor: indigo[500], color: '#ffffff' };
    }
    if (PostTypeUtils.isAnnouncement(type)) {
      return { backgroundColor: orange[500], color: '#ffffff' };
    }
    if (PostTypeUtils.isMoment(type)) {
      return { backgroundColor: blueGrey[500], color: '#ffffff' };
    }
    return {};
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
