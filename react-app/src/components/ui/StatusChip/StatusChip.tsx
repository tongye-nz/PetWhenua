import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import { cyan, pink, lightGreen, indigo, blueGrey, red } from '@mui/material/colors';
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
  userRole?: string;
  statusVariant?: 'status' | 'type' | 'role';
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  postType,
  userRole,
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
      return { backgroundColor: red[400], color: '#ffffff' };
    }
    if (PostTypeUtils.isMoment(type)) {
      return { backgroundColor: blueGrey[500], color: '#ffffff' };
    }
    return {};
  };

  const getUserRoleStyles = (role: string) => {
    const roleUpper = role.toUpperCase();
    
    if (roleUpper === 'SITE_ADMIN' || roleUpper === 'ADMIN') {
      return { backgroundColor: red[600], color: '#ffffff' };
    }
    if (roleUpper === 'MEETUP_ADMIN') {
      return { backgroundColor: cyan[600], color: '#ffffff' };
    }
    if (roleUpper === 'VET') {
      return { backgroundColor: indigo[600], color: '#ffffff' };
    }
    if (roleUpper === 'MEMBER') {
      return { backgroundColor: blueGrey[400], color: '#ffffff' };
    }
    // Default for any other role
    return { backgroundColor: blueGrey[300], color: '#000000' };
  };

  const formatUserRole = (role: string) => {
    const roleUpper = role.toUpperCase();
    
    if (roleUpper === 'SITE_ADMIN') return 'Site Admin';
    if (roleUpper === 'MEETUP_ADMIN') return 'Meetup Admin';
    if (roleUpper === 'VET') return 'Vet';
    if (roleUpper === 'MEMBER') return 'Member';
    
    // Fallback: capitalize first letter
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
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
  } else if (statusVariant === 'role' && userRole !== undefined) {
    // Use custom colors for user roles
    const customStyles = getUserRoleStyles(userRole);
    const formattedRole = formatUserRole(userRole);
    return (
      <Chip
        label={formattedRole}
        size="small"
        sx={{
          ...customStyles,
          fontWeight: 600,
          fontSize: '0.7rem',
          height: '20px',
          '& .MuiChip-label': {
            paddingX: 1,
            paddingY: 0
          }
        }}
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
